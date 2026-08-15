import { useI18n } from '../lib/i18n'
import type { Progress } from '../lib/types'

export function ProcessingView({
  progress,
  onCancel,
}: {
  progress: Progress
  onCancel: () => void
}) {
  const { t } = useI18n()
  const pct = Math.round(progress.fraction * 100)
  return (
    <div className="mx-auto max-w-xl">
      <div className="glass p-8 text-center">
        <div className="mb-5 text-5xl">⚡</div>
        <h2 className="mb-1 text-xl font-bold">{t('procTitle')}</h2>
        <p className="mb-6 text-sm text-gray-400">{t('procSub')}</p>

        <div className="progress-shimmer mb-2 h-3 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="grad-bg h-full rounded-full transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mb-6 flex justify-between text-xs text-gray-400">
          <span>{pct}%</span>
          <span>
            {progress.framesOut.toLocaleString()} {t('frames')} ·{' '}
            {Math.round(progress.processingFps)} fps
          </span>
        </div>

        <button
          onClick={onCancel}
          className="rounded-lg border border-white/15 px-5 py-2 text-sm text-gray-300 transition hover:bg-white/5"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  )
}
