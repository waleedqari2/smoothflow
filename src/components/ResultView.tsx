import { useMemo, useState } from 'react'
import type { ProcessResult, VideoInfo } from '../lib/types'

const fmtSize = (b: number) =>
  b > 1e9 ? `${(b / 1e9).toFixed(2)} GB` : `${(b / 1e6).toFixed(1)} MB`

const TIKTOK_STUDIO = 'https://www.tiktok.com/tiktokstudio/upload'

export function ResultView({
  info,
  result,
  onRestart,
}: {
  info: VideoInfo
  result: ProcessResult
  onRestart: () => void
}) {
  const downloadName = info.file.name.replace(
    /(\.\w+)?$/,
    `_${result.outFps}fps.mp4`,
  )
  const [shareError, setShareError] = useState<string | null>(null)
  // Mobile share sheet with the video attached (TikTok appears as a target
  // when its app is installed). Desktop browsers rarely support file shares.
  const shareFile = useMemo(
    () => new File([result.blob], downloadName, { type: 'video/mp4' }),
    [result.blob, downloadName],
  )
  const canShare =
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [shareFile] })

  const share = async () => {
    try {
      await navigator.share({ files: [shareFile] })
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setShareError('Sharing failed — download the file instead.')
      }
    }
  }
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="glass p-6 text-center">
        <div className="mb-2 text-4xl">✅</div>
        <h2 className="text-xl font-bold">
          Boosted to <span className="grad-text">{result.outFps} fps</span>
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          {result.multiplier > 1 && (
            <>
              {result.multiplier}× frames ·{' '}
              {result.engine === 'ai' ? 'AI interpolation' : 'basic blending'} ·{' '}
            </>
          )}
          {result.enhanced && (
            <span className="text-fuchsia-300">
              upscaled to {result.outWidth}×{result.outHeight} ·{' '}
            </span>
          )}
          finished in {Math.round(result.seconds)}s ·{' '}
          {fmtSize(result.blob.size)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass overflow-hidden">
          <p className="border-b border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Before · {info.fps} fps
          </p>
          <video
            src={URL.createObjectURL(info.file)}
            controls
            muted
            loop
            playsInline
            className="aspect-auto w-full"
          />
        </div>
        <div className="glass overflow-hidden ring-1 ring-violet-500/30">
          <p className="border-b border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider">
            <span className="grad-text">After · {result.outFps} fps</span>
          </p>
          <video
            src={result.url}
            controls
            muted
            loop
            playsInline
            className="aspect-auto w-full"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={result.url}
          download={downloadName}
          className="grad-bg min-w-52 flex-1 rounded-xl py-4 text-center text-lg font-bold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-90"
        >
          ⬇ Download {result.outFps} fps video
        </a>
        {canShare && (
          <button
            onClick={share}
            className="flex-1 rounded-xl border border-white/15 px-6 py-4 text-lg font-bold text-gray-200 transition hover:bg-white/5"
          >
            📤 Share
          </button>
        )}
        <a
          href={TIKTOK_STUDIO}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-6 py-4 text-center text-lg font-bold text-cyan-200 transition hover:bg-cyan-500/20"
        >
          ↗ Open TikTok Studio
        </a>
        <button
          onClick={onRestart}
          className="rounded-xl border border-white/15 px-6 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
        >
          New video
        </button>
      </div>
      {shareError && (
        <p className="text-center text-xs text-amber-300">{shareError}</p>
      )}
      <p className="text-center text-xs text-gray-500">
        Pro tip: upload through TikTok Studio for the best quality — download
        the video, drag it in, and turn on "Allow high-quality uploads" before
        posting.
      </p>
    </div>
  )
}
