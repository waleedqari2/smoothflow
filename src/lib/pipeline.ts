import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  VideoSample,
} from 'mediabunny'
import { createAiInterpolator } from './interpolate'
import { createBlendInterpolator } from './blend'
import { createUpscaler, type Upscaler } from './upscale'
import type {
  EngineKind,
  Interpolator,
  ProcessResult,
  Progress,
  Settings,
  VideoInfo,
} from './types'

const pad16 = (n: number) => Math.ceil(n / 16) * 16

export interface PipelineHandle {
  promise: Promise<ProcessResult>
  cancel: () => void
}

/**
 * Core pipeline: decode → interpolate (inject mid frames between each pair)
 * → encode MP4, fully in-browser via Mediabunny + WebCodecs.
 *
 * Frame injection happens in Conversion's `video.process` hook: for each
 * incoming sample we emit the (multiplier-1) interpolated mids between the
 * previous and current frame, followed by the current frame itself, with
 * explicit timestamps. We deliberately do NOT set `frameRate`, since
 * Mediabunny's own frame-rate correction runs *before* `process` and would
 * fight the injection — our timestamps alone define the output rate.
 */
export function runPipeline(
  info: VideoInfo,
  settings: Settings,
  preferredEngine: EngineKind,
  onProgress: (p: Progress) => void,
): PipelineHandle {
  let conversion: Conversion | null = null
  let cancelled = false

  const promise = (async (): Promise<ProcessResult> => {
    const t0 = performance.now()

    let multiplier = Math.round(settings.targetFps / info.fps)
    if (multiplier < 2 && !settings.enhance) {
      throw new Error(
        `This video is already ${info.fps} fps — pick a higher target, or turn on AI Upscale to enhance clarity instead.`,
      )
    }
    // Enhance-only run: no interpolation, just the SR pass on every frame.
    if (multiplier < 1) multiplier = 1
    const slowmo = settings.mode === 'slowmo'
    // In slow-mo the wall-clock fps stays at the source rate; in smooth mode
    // it becomes source*multiplier.
    const outFps = Math.round(slowmo ? info.fps : info.fps * multiplier)

    // Working resolution (optionally capped to 1080p on the long edge).
    // The enhance pass doubles the output, so cap the working size then too —
    // otherwise a 4K source would balloon to 8K.
    let w = info.width
    let h = info.height
    if ((settings.limitTo1080p || settings.enhance) && Math.max(w, h) > 1920) {
      const down = 1920 / Math.max(w, h)
      w = Math.round(w * down)
      h = Math.round(h * down)
    }
    // Encoders want even dimensions.
    w -= w % 2
    h -= h % 2
    const padW = pad16(w)
    const padH = pad16(h)

    // --- interpolation engine (AI with graceful fallback to blend) ---
    let engine: Interpolator
    if (preferredEngine === 'ai') {
      try {
        engine = await createAiInterpolator(padW, padH)
      } catch (err) {
        console.warn('AI engine unavailable, falling back to blend:', err)
        engine = createBlendInterpolator()
      }
    } else {
      engine = createBlendInterpolator()
    }

    // --- optional neural 2x upscale pass ---
    let upscaler: Upscaler | null = null
    if (settings.enhance) {
      try {
        upscaler = await createUpscaler(padW, padH)
      } catch (err) {
        console.warn('Upscaler unavailable, continuing without enhance:', err)
      }
    }
    const scale = upscaler?.scale ?? 1
    const outW = w * scale
    const outH = h * scale

    // --- canvases for pixel shuffling ---
    // padCanvas: frame drawn at top-left, padded to /16 for the model.
    const padCanvas = new OffscreenCanvas(padW, padH)
    const padCtx = padCanvas.getContext('2d', { willReadFrequently: true })!
    // upCanvas: receives upscaled padded frames before cropping.
    const upCanvas = new OffscreenCanvas(padW * scale, padH * scale)
    const upCtx = upCanvas.getContext('2d')!
    // outCanvas: crops the padding back off for the encoder.
    const outCanvas = new OffscreenCanvas(outW, outH)
    const outCtx = outCanvas.getContext('2d')!
    const midImageData = new ImageData(padW, padH)
    const upImageData =
      scale > 1 ? new ImageData(padW * scale, padH * scale) : midImageData

    const input = new Input({
      source: new BlobSource(info.file),
      formats: ALL_FORMATS,
    })
    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
      target: new BufferTarget(),
    })

    // Interpolation state across process() calls.
    let prevRgba: Uint8Array | null = null
    let prevTs = 0
    let framesOut = 0

    // ts positions of mids within a frame gap, e.g. x4 → [0.25, 0.5, 0.75]
    const midTs: number[] = []
    for (let k = 1; k < multiplier; k++) midTs.push(k / multiplier)

    const timeScale = slowmo ? multiplier : 1

    const sampleFromRgba = async (
      rgba: Uint8Array,
      timestamp: number,
      duration: number,
    ): Promise<VideoSample> => {
      if (upscaler) {
        upImageData.data.set(await upscaler.run(rgba))
        upCtx.putImageData(upImageData, 0, 0)
        outCtx.drawImage(upCanvas, 0, 0, outW, outH, 0, 0, outW, outH)
      } else {
        midImageData.data.set(rgba)
        padCtx.putImageData(midImageData, 0, 0)
        outCtx.drawImage(padCanvas, 0, 0, w, h, 0, 0, w, h)
      }
      return new VideoSample(outCanvas, { timestamp, duration })
    }

    conversion = await Conversion.init({
      input,
      output,
      video: {
        forceTranscode: true,
        quality: QUALITY_HIGH,
        processedWidth: outW,
        processedHeight: outH,
        process: async (sample) => {
          // Extract padded RGBA pixels for the interpolator.
          padCtx.clearRect(0, 0, padW, padH)
          sample.draw(padCtx, 0, 0, w, h)
          const currRgba = new Uint8Array(
            padCtx.getImageData(0, 0, padW, padH).data.buffer.slice(0),
          )
          const currTs = sample.timestamp * timeScale
          sample.close()

          const emitted: VideoSample[] = []

          if (prevRgba && midTs.length > 0) {
            const gap = currTs - prevTs
            if (gap > 0) {
              const mids = await engine.mids(prevRgba, currRgba, midTs)
              for (let k = 0; k < mids.length; k++) {
                emitted.push(
                  await sampleFromRgba(
                    mids[k],
                    prevTs + gap * midTs[k],
                    gap / multiplier,
                  ),
                )
              }
            }
          }
          emitted.push(await sampleFromRgba(currRgba, currTs, 1 / outFps))

          prevRgba = currRgba
          prevTs = currTs
          framesOut += emitted.length
          return emitted
        },
      },
      audio: slowmo ? { discard: true } : undefined,
    })

    if (!conversion.isValid) {
      const reasons = conversion.discardedTracks
        .map((t) => t.reason)
        .join(', ')
      throw new Error(`Cannot convert this file (${reasons}).`)
    }

    conversion.onProgress = (fraction, processedTime) => {
      onProgress({
        fraction,
        framesOut,
        processingFps: framesOut / ((performance.now() - t0) / 1000),
        processedTime,
      })
    }

    try {
      await conversion.execute()
    } finally {
      engine.destroy()
      upscaler?.destroy()
    }

    if (cancelled) throw new Error('cancelled')

    const buffer = (output.target as BufferTarget).buffer
    if (!buffer) throw new Error('Encoding produced no output.')
    const blob = new Blob([buffer], { type: 'video/mp4' })

    return {
      blob,
      url: URL.createObjectURL(blob),
      outFps,
      multiplier,
      engine: engine.kind,
      seconds: (performance.now() - t0) / 1000,
      outWidth: outW,
      outHeight: outH,
      enhanced: !!upscaler,
    }
  })()

  return {
    promise,
    cancel: () => {
      cancelled = true
      void conversion?.cancel()
    },
  }
}
