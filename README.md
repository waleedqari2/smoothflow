# ⚡ SmoothFlow

Boost any video to **60 / 120 / 240 fps** with AI frame interpolation — running
**entirely in your browser**. No uploads, no server, no accounts.

- **AI engine**: RIFE-family neural model (2.9 MB) on raw WebGPU via
  [framegen](https://github.com/MONZikWasTaken/Framegen)
- **Media engine**: decode/encode/mux via
  [Mediabunny](https://github.com/Vanilagy/mediabunny) (WebCodecs)
- **Fallback**: basic frame blending when WebGPU isn't available
- **Modes**: Smooth motion (same length, more frames) · Slow motion (stretched,
  silky smooth)

## The honest TikTok note

TikTok plays back at **60 fps maximum** and re-encodes anything higher. For
TikTok uploads, pick **60 fps** (and enable "Allow high-quality uploads" in the
TikTok app). 120/240 fps output is best used as slow-motion source footage or
for platforms that support it.

## Requirements

Chrome or Edge (desktop) — WebCodecs required, WebGPU recommended for the AI
engine.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Deploys as a fully static site (Vercel/Netlify/Cloudflare Pages).

## Licenses

App code MIT. The bundled framegen **model weights are licensed for
non-commercial use** — see
[WEIGHTS_LICENSE](https://github.com/MONZikWasTaken/Framegen/blob/main/WEIGHTS_LICENSE.md).
