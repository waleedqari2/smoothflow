import { useI18n } from '../lib/i18n'
import type { Caps } from '../lib/types'

export function CompatGate({ caps }: { caps: Caps }) {
  const { t } = useI18n()
  if (caps.webcodecs) return null
  return (
    <div className="glass mx-auto mt-16 max-w-lg p-8 text-center">
      <div className="mb-3 text-4xl">🖥️</div>
      <h2 className="mb-2 text-xl font-bold">{t('gateTitle')}</h2>
      <p className="text-sm leading-relaxed text-gray-400">{t('gateBody')}</p>
    </div>
  )
}

export function EngineBadge({ caps }: { caps: Caps }) {
  const ai = caps.webgpu
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        ai
          ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
          : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
      }`}
      title={
        ai
          ? 'AI frame interpolation (RIFE-family neural model on WebGPU)'
          : 'WebGPU unavailable — using basic frame blending (lower quality)'
      }
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${ai ? 'bg-violet-400' : 'bg-amber-400'}`}
      />
      {ai ? 'AI Engine · WebGPU' : 'Basic Engine · no WebGPU'}
    </span>
  )
}
