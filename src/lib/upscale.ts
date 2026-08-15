import { createSR } from 'framegen/sr'
import { fetchWeights, getGpuDevice } from './gpu'

export interface Upscaler {
  readonly scale: number
  /** Upscale one padded RGBA frame (w×h → 2w×2h). */
  run(rgba: Uint8Array): Promise<Uint8Array>
  destroy(): void
}

/**
 * Neural 2x super-resolution via framegen's SR pass (residual-vs-bilinear,
 * three tiny convs, fully GPU-resident). We upload RGBA into a texture, run
 * SR into a 2x texture, and read back through an aligned staging buffer.
 */
export async function createUpscaler(
  padW: number,
  padH: number,
): Promise<Upscaler> {
  const device = await getGpuDevice()
  const { bin, manifest } = await fetchWeights('rt_sr')
  const sr = await createSR(device, {
    weightsBin: bin,
    weightsManifest: manifest,
  })
  const scale = sr.scale
  const outW = padW * scale
  const outH = padH * scale

  const srcTex = device.createTexture({
    size: [padW, padH],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  })
  const dstTex = device.createTexture({
    size: [outW, outH],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC,
  })

  const rowBytes = outW * 4
  const alignedRowBytes = Math.ceil(rowBytes / 256) * 256
  const staging = device.createBuffer({
    size: alignedRowBytes * outH,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  return {
    scale,
    async run(rgba) {
      device.queue.writeTexture(
        { texture: srcTex },
        rgba as BufferSource,
        { bytesPerRow: padW * 4, rowsPerImage: padH },
        [padW, padH],
      )
      // process() returns false while its per-size pipelines are still
      // compiling asynchronously — wait them out.
      while (!sr.process(srcTex, dstTex, padW, padH)) {
        await new Promise((r) => setTimeout(r, 30))
      }
      const enc = device.createCommandEncoder()
      enc.copyTextureToBuffer(
        { texture: dstTex },
        { buffer: staging, bytesPerRow: alignedRowBytes, rowsPerImage: outH },
        [outW, outH],
      )
      device.queue.submit([enc.finish()])
      await staging.mapAsync(GPUMapMode.READ)
      const mapped = new Uint8Array(staging.getMappedRange())
      const out = new Uint8Array(rowBytes * outH)
      if (alignedRowBytes === rowBytes) {
        out.set(mapped.subarray(0, out.length))
      } else {
        for (let y = 0; y < outH; y++) {
          out.set(
            mapped.subarray(
              y * alignedRowBytes,
              y * alignedRowBytes + rowBytes,
            ),
            y * rowBytes,
          )
        }
      }
      staging.unmap()
      return out
    },
    destroy() {
      srcTex.destroy()
      dstTex.destroy()
      staging.destroy()
    },
  }
}
