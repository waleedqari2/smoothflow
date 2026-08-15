import { useCallback, useRef, useState } from 'react'

export function DropZone({
  onFile,
  busy,
  error,
}: {
  onFile: (f: File) => void
  busy: boolean
  error: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const f = files?.[0]
      if (f) onFile(f)
    },
    [onFile],
  )

  return (
    <div className="mx-auto max-w-2xl">
      <div
        className={`glass cursor-pointer border-2 border-dashed p-14 text-center transition-all duration-200 ${
          dragging
            ? 'scale-[1.02] !border-violet-500/70 bg-violet-500/5'
            : 'hover:!border-white/25'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
      >
        <div className="mb-4 text-5xl">{busy ? '⏳' : '🎬'}</div>
        <p className="mb-1 text-lg font-semibold">
          {busy ? 'Reading video…' : 'Drop your video here'}
        </p>
        <p className="text-sm text-gray-400">
          or <span className="grad-text font-semibold">browse files</span> · MP4,
          MOV, WebM · processed locally, never uploaded
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}
