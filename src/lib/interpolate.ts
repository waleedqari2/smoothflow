import { createRT, type RT } from 'framegen'
import type { Interpolator } from './types'

/**
 * AI interpolator backed by framegen (distilled RIFE-family model on raw
 * WebGPU). The 1.4.0 "tfact" weights require texture input/output mode, so we
 * upload padded RGBA8 buffers into GPUTextures, run the model, and read the
 * mids back through a 256-byte-row-aligned staging buffer.
 */
export async function createAiInterpolator(
  padW: number,
  padH: number,
): Promise<Interpolator> {
  const adapter = await navigator.gpu?.requestAdapter()
  if (!adapter) throw new Error('WebGPU is not available')
  const device = await adapter.requestDevice({
    requiredFeatures: adapter.features.has('shader-f16')
      ? (['shader-f16'] as GPUFeatureName[])
      : [],
  })

  const [weightsBin, weightsManifest] = await Promise.all([
    fetch(`${import.meta.env.BASE_URL}weights/rt_v7s.bin`).then((r) => {
      if (!r.ok) throw new Error('Failed to load model weights')
      return r.arrayBuffer()
    }),
    fetch(`${import.meta.env.BASE_URL}weights/rt_v7s.json`).then((r) => {
      if (!r.ok) throw new Error('Failed to load model manifest')
      return r.json()
    }),
  ])

  const rt: RT = await createRT(device, {
    w: padW,
    h: padH,
    weightsBin,
    weightsManifest,
    textureInput: true,
    textureOutput: true,
  })

  const inputTex = () =>
    device.createTexture({
      size: [padW, padH],
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.STORAGE_BINDING,
    })
  const texA = inputTex()
  const texB = inputTex()
  const outTexPool: GPUTexture[] = []

  // WebGPU texture→buffer copies need bytesPerRow % 256 === 0.
  const rowBytes = padW * 4
  const alignedRowBytes = Math.ceil(rowBytes / 256) * 256
  const staging = device.createBuffer({
    size: alignedRowBytes * padH,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  const upload = (tex: GPUTexture, rgba: Uint8Array) => {
    device.queue.writeTexture(
      { texture: tex },
      rgba as BufferSource,
      { bytesPerRow: rowBytes, rowsPerImage: padH },
      [padW, padH],
    )
  }

  const readback = async (tex: GPUTexture): Promise<Uint8Array> => {
    const enc = device.createCommandEncoder()
    enc.copyTextureToBuffer(
      { texture: tex },
      { buffer: staging, bytesPerRow: alignedRowBytes, rowsPerImage: padH },
      [padW, padH],
    )
    device.queue.submit([enc.finish()])
    await staging.mapAsync(GPUMapMode.READ)
    const mapped = new Uint8Array(staging.getMappedRange())
    const out = new Uint8Array(rowBytes * padH)
    if (alignedRowBytes === rowBytes) {
      out.set(mapped.subarray(0, out.length))
    } else {
      for (let y = 0; y < padH; y++) {
        out.set(
          mapped.subarray(y * alignedRowBytes, y * alignedRowBytes + rowBytes),
          y * rowBytes,
        )
      }
    }
    staging.unmap()
    return out
  }

  return {
    kind: 'ai',
    async mids(a, b, ts) {
      upload(texA, a)
      upload(texB, b)
      while (outTexPool.length < ts.length) {
        outTexPool.push(
          device.createTexture({
            size: [padW, padH],
            format: 'rgba8unorm',
            usage:
              GPUTextureUsage.STORAGE_BINDING |
              GPUTextureUsage.COPY_SRC |
              GPUTextureUsage.TEXTURE_BINDING,
          }),
        )
      }
      const outs = outTexPool.slice(0, ts.length)
      await rt.runMulti(texA, texB, ts, outs)
      const results: Uint8Array[] = []
      for (const tex of outs) results.push(await readback(tex))
      return results
    },
    destroy() {
      rt.destroy()
      texA.destroy()
      texB.destroy()
      for (const t of outTexPool) t.destroy()
      staging.destroy()
      device.destroy()
    },
  }
}
