import type { Interpolator } from './types'

/**
 * Basic fallback interpolator: per-pixel linear cross-fade between the two
 * frames. Far below AI quality (ghosting on fast motion) but runs anywhere
 * WebCodecs runs — keeps the app usable without WebGPU.
 */
export function createBlendInterpolator(): Interpolator {
  return {
    kind: 'blend',
    mids(a, b, ts) {
      const results: Uint8Array[] = []
      for (const t of ts) {
        const out = new Uint8Array(a.length)
        const w1 = 1 - t
        for (let i = 0; i < a.length; i++) {
          out[i] = a[i] * w1 + b[i] * t
        }
        results.push(out)
      }
      return Promise.resolve(results)
    },
    destroy() {},
  }
}
