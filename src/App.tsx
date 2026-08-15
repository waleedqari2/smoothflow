import { useEffect, useRef, useState } from 'react'
import { CompatGate, EngineBadge } from './components/CompatGate'
import { DropZone } from './components/DropZone'
import { SettingsPanel } from './components/SettingsPanel'
import { ProcessingView } from './components/ProcessingView'
import { ResultView } from './components/ResultView'
import { probeFile } from './lib/probe'
import { runPipeline, type PipelineHandle } from './lib/pipeline'
import {
  detectCaps,
  type Caps,
  type ProcessResult,
  type Progress,
  type Settings,
  type VideoInfo,
} from './lib/types'

type Stage = 'drop' | 'settings' | 'processing' | 'done'

const DEFAULT_SETTINGS: Settings = {
  targetFps: 60,
  mode: 'smooth',
  limitTo1080p: true,
  enhance: false,
}

const STEPS: { key: Stage; label: string }[] = [
  { key: 'drop', label: 'Upload' },
  { key: 'settings', label: 'Settings' },
  { key: 'processing', label: 'Process' },
  { key: 'done', label: 'Download' },
]

export default function App() {
  const [caps, setCaps] = useState<Caps | null>(null)
  const [stage, setStage] = useState<Stage>('drop')
  const [info, setInfo] = useState<VideoInfo | null>(null)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [progress, setProgress] = useState<Progress>({
    fraction: 0,
    framesOut: 0,
    processingFps: 0,
    processedTime: 0,
  })
  const [result, setResult] = useState<ProcessResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const pipelineRef = useRef<PipelineHandle | null>(null)

  useEffect(() => {
    void detectCaps().then(setCaps)
  }, [])

  const handleFile = async (file: File) => {
    setError(null)
    setBusy(true)
    try {
      const probed = await probeFile(file)
      setInfo(probed)
      setStage('settings')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not read this video file.',
      )
    } finally {
      setBusy(false)
    }
  }

  const start = () => {
    if (!info || !caps) return
    setError(null)
    setProgress({ fraction: 0, framesOut: 0, processingFps: 0, processedTime: 0 })
    setStage('processing')
    const handle = runPipeline(
      info,
      settings,
      caps.webgpu ? 'ai' : 'blend',
      setProgress,
    )
    pipelineRef.current = handle
    handle.promise
      .then((res) => {
        setResult(res)
        setStage('done')
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        if (!/cancel/i.test(msg)) setError(msg)
        setStage('settings')
      })
  }

  const cancel = () => {
    pipelineRef.current?.cancel()
    setStage('settings')
  }

  const restart = () => {
    if (result) URL.revokeObjectURL(result.url)
    setResult(null)
    setInfo(null)
    setError(null)
    setStage('drop')
  }

  const stepIndex = STEPS.findIndex((s) => s.key === stage)

  return (
    <div className="min-h-screen px-4 pb-20">
      <div className="aurora" />

      <header className="mx-auto flex max-w-5xl items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-lg font-extrabold tracking-tight">
            Smooth<span className="grad-text">Flow</span>
          </span>
        </div>
        {caps && <EngineBadge caps={caps} />}
      </header>

      <main className="mx-auto max-w-5xl">
        {/* hero */}
        {stage === 'drop' && (
          <section className="py-10 text-center">
            <h1 className="mx-auto mb-4 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
              Make your videos <span className="grad-text">buttery smooth</span>
            </h1>
            <p className="mx-auto mb-6 max-w-xl text-gray-400">
              AI frame interpolation to 60, 120 or 240 fps — running entirely in
              your browser. No uploads, no accounts, free forever.
            </p>
            <div className="mb-10 flex justify-center">
              <span className="glass inline-flex items-center gap-2 !rounded-full px-5 py-2 text-sm font-extrabold tracking-wide">
                <span>👨‍💻</span>
                <span>
                  Coded By <span className="grad-text">WaLiD</span>
                </span>
              </span>
            </div>
          </section>
        )}

        {/* step indicator */}
        <nav className="mb-8 flex items-center justify-center gap-2 text-xs font-medium">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <div className="h-px w-8 bg-white/15" />}
              <span
                className={`flex items-center gap-1.5 ${
                  i === stepIndex
                    ? 'text-white'
                    : i < stepIndex
                      ? 'text-violet-400'
                      : 'text-gray-500'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                    i === stepIndex
                      ? 'grad-bg text-white'
                      : i < stepIndex
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'bg-white/10'
                  }`}
                >
                  {i < stepIndex ? '✓' : i + 1}
                </span>
                {s.label}
              </span>
            </div>
          ))}
        </nav>

        {caps && !caps.webcodecs ? (
          <CompatGate caps={caps} />
        ) : (
          <>
            {stage === 'drop' && (
              <DropZone onFile={handleFile} busy={busy} error={error} />
            )}
            {stage === 'settings' && info && (
              <>
                {error && (
                  <p className="mx-auto mb-4 max-w-2xl rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </p>
                )}
                <SettingsPanel
                  info={info}
                  settings={settings}
                  onChange={setSettings}
                  onStart={start}
                  onBack={restart}
                />
              </>
            )}
            {stage === 'processing' && (
              <ProcessingView progress={progress} onCancel={cancel} />
            )}
            {stage === 'done' && info && result && (
              <ResultView info={info} result={result} onRestart={restart} />
            )}
          </>
        )}
      </main>

      <footer className="mx-auto mt-16 max-w-5xl border-t border-white/5 pt-6 text-center text-xs text-gray-500">
        Videos are processed on your device and never leave it. · AI model:
        RIFE-family via{' '}
        <a
          href="https://github.com/MONZikWasTaken/Framegen"
          className="underline hover:text-gray-300"
          target="_blank"
          rel="noreferrer"
        >
          framegen
        </a>{' '}
        (non-commercial weights) · Media engine:{' '}
        <a
          href="https://github.com/Vanilagy/mediabunny"
          className="underline hover:text-gray-300"
          target="_blank"
          rel="noreferrer"
        >
          Mediabunny
        </a>
      </footer>
    </div>
  )
}
