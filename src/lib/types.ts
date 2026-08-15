export interface VideoInfo {
  file: File
  width: number
  height: number
  fps: number
  duration: number
  codec: string | null
  hasAudio: boolean
}

export type ProcessMode = 'smooth' | 'slowmo'

export interface Settings {
  targetFps: 60 | 120 | 240
  mode: ProcessMode
  /** Downscale >1080p sources to 1080p for speed (TikTok native). */
  limitTo1080p: boolean
}

export type EngineKind = 'ai' | 'blend'

/** Frame interpolator working on padded RGBA buffers (dims divisible by 16). */
export interface Interpolator {
  readonly kind: EngineKind
  /** Generate mid frames between a and b at each t in (0,1). */
  mids(a: Uint8Array, b: Uint8Array, ts: number[]): Promise<Uint8Array[]>
  destroy(): void
}

export interface Progress {
  /** 0..1 overall */
  fraction: number
  /** frames written so far */
  framesOut: number
  /** effective output fps of processing (frames/sec of wall time) */
  processingFps: number
  /** seconds of input processed */
  processedTime: number
}

export interface ProcessResult {
  blob: Blob
  url: string
  outFps: number
  multiplier: number
  engine: EngineKind
  seconds: number
}

export interface Caps {
  webcodecs: boolean
  webgpu: boolean
  shaderF16: boolean
}

export async function detectCaps(): Promise<Caps> {
  const webcodecs =
    typeof VideoEncoder !== 'undefined' && typeof VideoDecoder !== 'undefined'
  let webgpu = false
  let shaderF16 = false
  try {
    const adapter = await navigator.gpu?.requestAdapter()
    if (adapter) {
      webgpu = true
      shaderF16 = adapter.features.has('shader-f16')
    }
  } catch {
    /* no webgpu */
  }
  return { webcodecs, webgpu, shaderF16 }
}
