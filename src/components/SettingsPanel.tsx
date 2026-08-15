import { useI18n, type TKey } from '../lib/i18n'
import type { Settings, VideoInfo } from '../lib/types'

const fmtSize = (b: number) =>
  b > 1e9 ? `${(b / 1e9).toFixed(2)} GB` : `${(b / 1e6).toFixed(1)} MB`

const fmtDur = (s: number) => {
  const m = Math.floor(s / 60)
  return `${m}:${Math.round(s % 60)
    .toString()
    .padStart(2, '0')}`
}

export function SettingsPanel({
  info,
  settings,
  onChange,
  onStart,
  onBack,
}: {
  info: VideoInfo
  settings: Settings
  onChange: (s: Settings) => void
  onStart: () => void
  onBack: () => void
}) {
  const { t } = useI18n()

  const fpsOptions: {
    value: 60 | 120 | 240
    tag: TKey
    desc: TKey
  }[] = [
    { value: 60, tag: 'fps60Tag', desc: 'fps60Desc' },
    { value: 120, tag: 'fps120Tag', desc: 'fps120Desc' },
    { value: 240, tag: 'fps240Tag', desc: 'fps240Desc' },
  ]

  // Mirrors the pipeline's 8x multiplier cap.
  const mult = Math.min(8, Math.round(settings.targetFps / info.fps))
  const impossible = mult < 2 && !settings.enhance
  const fpsOnly = mult >= 2
  // Mirrors the pipeline's sizing: cap the long edge at 1920, then double.
  const down = Math.min(1, 1920 / Math.max(info.width, info.height))
  const upW = Math.round(info.width * down) * 2
  const upH = Math.round(info.height * down) * 2

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* file summary */}
      <div className="glass flex items-center justify-between px-5 py-4 text-sm">
        <div className="truncate pe-4">
          <p className="truncate font-semibold">{info.file.name}</p>
          <p className="text-gray-400">
            {info.width}×{info.height} · {info.fps} fps · {fmtDur(info.duration)}{' '}
            · {fmtSize(info.file.size)}
            {info.hasAudio ? ' · 🔊' : ` · ${t('muted')}`}
          </p>
        </div>
        <button
          onClick={onBack}
          className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-white/5"
        >
          {t('change')}
        </button>
      </div>

      {/* target fps */}
      <div className="glass p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          {t('targetFps')}
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {fpsOptions.map((o) => {
            const selected = settings.targetFps === o.value
            return (
              <button
                key={o.value}
                onClick={() => onChange({ ...settings, targetFps: o.value })}
                className={`rounded-xl border p-4 text-start transition ${
                  selected
                    ? 'border-violet-500/60 bg-violet-500/10 ring-1 ring-violet-500/40'
                    : 'border-white/10 hover:border-white/25'
                }`}
              >
                <p className="text-xl font-bold">{o.value} fps</p>
                <p
                  className={`mb-1 text-[11px] font-semibold ${selected ? 'grad-text' : 'text-gray-400'}`}
                >
                  {t(o.tag)}
                </p>
                <p className="text-xs leading-snug text-gray-400">{t(o.desc)}</p>
              </button>
            )
          })}
        </div>
        {settings.targetFps > 60 && (
          <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/90">
            {t('tiktokWarn')}
          </p>
        )}
      </div>

      {/* mode */}
      <div className="glass p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          {t('mode')}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => onChange({ ...settings, mode: 'smooth' })}
            className={`rounded-xl border p-4 text-start transition ${
              settings.mode === 'smooth'
                ? 'border-cyan-500/60 bg-cyan-500/10 ring-1 ring-cyan-500/40'
                : 'border-white/10 hover:border-white/25'
            }`}
          >
            <p className="font-bold">{t('smoothTitle')}</p>
            <p className="text-xs leading-snug text-gray-400">
              {t('smoothDesc', { mult })}
            </p>
          </button>
          <button
            onClick={() => onChange({ ...settings, mode: 'slowmo' })}
            className={`rounded-xl border p-4 text-start transition ${
              settings.mode === 'slowmo'
                ? 'border-cyan-500/60 bg-cyan-500/10 ring-1 ring-cyan-500/40'
                : 'border-white/10 hover:border-white/25'
            }`}
          >
            <p className="font-bold">{t('slowmoTitle')}</p>
            <p className="text-xs leading-snug text-gray-400">
              {t('slowmoDesc', { mult })}
            </p>
          </button>
        </div>
      </div>

      {/* clarity */}
      <div className="glass p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          {t('clarity')}
        </h3>
        <button
          onClick={() => onChange({ ...settings, enhance: !settings.enhance })}
          className={`w-full rounded-xl border p-4 text-start transition ${
            settings.enhance
              ? 'border-fuchsia-500/60 bg-fuchsia-500/10 ring-1 ring-fuchsia-500/40'
              : 'border-white/10 hover:border-white/25'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-bold">{t('upscaleTitle')}</p>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                settings.enhance
                  ? 'bg-fuchsia-500/20 text-fuchsia-300'
                  : 'bg-white/10 text-gray-400'
              }`}
            >
              {settings.enhance ? t('on') : t('off')}
            </span>
          </div>
          <p className="mt-1 text-xs leading-snug text-gray-400">
            {t('upscaleDesc', {
              from: `${info.width}×${info.height}`,
              to: `${upW}×${upH}`,
            })}
          </p>
        </button>
      </div>

      {/* extras */}
      {Math.max(info.width, info.height) > 1920 && !settings.enhance && (
        <label className="glass flex cursor-pointer items-center gap-3 px-5 py-4 text-sm">
          <input
            type="checkbox"
            checked={settings.limitTo1080p}
            onChange={(e) =>
              onChange({ ...settings, limitTo1080p: e.target.checked })
            }
            className="h-4 w-4 accent-violet-500"
          />
          <span>
            {t('downscale1080')}{' '}
            <span className="text-gray-400">{t('downscale1080Note')}</span>
          </span>
        </label>
      )}

      {impossible && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {t('alreadyFps', { fps: info.fps })}
        </p>
      )}

      <button
        onClick={onStart}
        disabled={impossible}
        className="grad-bg w-full rounded-xl py-4 text-lg font-bold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {fpsOnly
          ? settings.enhance
            ? t('boostUpscaleBtn', { fps: settings.targetFps })
            : t('boostBtn', { fps: settings.targetFps })
          : t('enhanceBtn')}
      </button>
    </div>
  )
}
