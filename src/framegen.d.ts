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
