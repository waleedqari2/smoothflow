// framegen ships index.d.ts but its package.json "exports" map doesn't expose
// it, so TS can't resolve the types. Minimal local declaration (buffer-mode
// subset we use; see node_modules/framegen/index.d.ts for the full surface).
declare module 'framegen' {
  export interface CreateRTOptions {
    /** Output width in pixels. Must be divisible by 16. */
    w: number
    /** Output height in pixels. Must be divisible by 16. */
    h: number
    weightsBin: ArrayBuffer
    weightsManifest: Record<string, { offset: number; shape: number[] }>
    textureInput?: boolean
    textureOutput?: boolean
  }

  export interface RT {
    run(rgbaA: Uint8Array, rgbaB: Uint8Array, t?: number): Promise<Uint8Array>
    runMulti(
      a: Uint8Array | GPUTexture,
      b: Uint8Array | GPUTexture,
      ts: number[],
      outTexs?: GPUTexture[],
    ): Promise<Uint8Array[] | null>
    prepPair(a: GPUTexture, b: GPUTexture): void
    runT(t: number, outTex: GPUTexture): void
    destroy(): void
    readonly w: number
    readonly h: number
  }

  export function createRT(
    device: GPUDevice,
    opts: CreateRTOptions,
  ): Promise<RT>
}

declare module 'framegen/sr' {
  export interface SR {
    /**
     * Run the SR pass srcTex (w×h) → dstTex (scale·w × scale·h, rgba8unorm
     * STORAGE_BINDING). Returns false while per-size pipelines are still
     * compiling — retry shortly.
     */
    process(
      srcTex: GPUTexture,
      dstTex: GPUTexture,
      w: number,
      h: number,
    ): boolean
    scale: number
  }

  export function createSR(
    device: GPUDevice,
    opts: {
      weightsBin: ArrayBuffer
      weightsManifest: Record<string, { offset: number; shape: number[] }>
      channels?: number
    },
  ): Promise<SR>
}
