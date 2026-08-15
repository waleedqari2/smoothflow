/**
 * Shared WebGPU device — the interpolator and the upscaler run on the same
 * device so textures could be shared later. Page-lifetime singleton; never
 * destroyed (destroying it would break whichever engine is still alive).
 */
let devicePromise: Promise<GPUDevice> | null = null

export function getGpuDevice(): Promise<GPUDevice> {
  devicePromise ??= (async () => {
    const adapter = await navigator.gpu?.requestAdapter()
    if (!adapter) throw new Error('WebGPU is not available')
    return adapter.requestDevice({
      requiredFeatures: adapter.features.has('shader-f16')
        ? (['shader-f16'] as GPUFeatureName[])
        : [],
    })
  })()
  return devicePromise
}

export async function fetchWeights(
  name: string,
): Promise<{ bin: ArrayBuffer; manifest: Record<string, { offset: number; shape: number[] }> }> {
  const base = `${import.meta.env.BASE_URL}weights/${name}`
  const [bin, manifest] = await Promise.all([
    fetch(`${base}.bin`).then((r) => {
      if (!r.ok) throw new Error(`Failed to load ${name} weights`)
      return r.arrayBuffer()
    }),
    fetch(`${base}.json`).then((r) => {
      if (!r.ok) throw new Error(`Failed to load ${name} manifest`)
      return r.json()
    }),
  ])
  return { bin, manifest }
}
