import { useState } from 'react'
import { useFiles } from '../hooks/useFiles'
import { IMAGE_FORMATS, suggestedFileName, type ImageFormat } from '../lib/imageFormat'

type FileStatus =
  | { state: 'pending' }
  | { state: 'converting' }
  | { state: 'done' }
  | { state: 'error'; message: string }

function statusLabel(status: FileStatus | undefined): string {
  if (!status || status.state === 'pending') return 'Pendiente'
  if (status.state === 'converting') return 'Convirtiendo…'
  if (status.state === 'done') return 'Listo'
  return status.message
}

function statusClassName(status: FileStatus | undefined): string {
  if (status?.state === 'done') return 'text-convert'
  if (status?.state === 'error') return 'text-vectorize'
  return 'text-text-secondary'
}

function ConvertScreen(): React.JSX.Element {
  const { files } = useFiles()

  const [format, setFormat] = useState<ImageFormat>('png')
  const [quality, setQuality] = useState(80)
  const [isConverting, setIsConverting] = useState(false)
  const [statuses, setStatuses] = useState<Record<string, FileStatus>>({})

  const doneCount = files.filter(
    (file) => statuses[file.path]?.state === 'done' || statuses[file.path]?.state === 'error'
  ).length

  async function handleConvertAll(): Promise<void> {
    if (files.length === 0) return

    const directory = await window.api.chooseDirectory()
    if (!directory) return

    setIsConverting(true)
    setStatuses(Object.fromEntries(files.map((file) => [file.path, { state: 'pending' }])))

    for (const file of files) {
      setStatuses((prev) => ({ ...prev, [file.path]: { state: 'converting' } }))

      const destPath = window.api.joinPath(directory, suggestedFileName(file.name, format))
      const result = await window.api.convertImage({
        sourcePath: file.path,
        destPath,
        format,
        quality
      })

      setStatuses((prev) => ({
        ...prev,
        [file.path]: result.ok ? { state: 'done' } : { state: 'error', message: result.error }
      }))
    }

    setIsConverting(false)
  }

  return (
    <section className="max-w-2xl" data-testid="screen-convert">
      <h1 className="mt-0 mb-2 text-2xl font-semibold text-text">Convertir</h1>
      <p className="mb-6 text-text-secondary">
        Convertí tus imágenes entre PNG, JPG, WEBP, AVIF, TIFF y GIF.
      </p>

      {files.length === 0 && (
        <p className="text-text-secondary">
          Seleccioná uno o más archivos arriba para convertirlos.
        </p>
      )}

      {files.length > 0 && (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-text-secondary">
            Formato destino
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value as ImageFormat)}
              className="rounded-lg bg-surface px-3 py-2 text-text"
            >
              {IMAGE_FORMATS.map((option) => (
                <option key={option} value={option}>
                  {option.toUpperCase()}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-text-secondary">
            Calidad ({quality})
            <input
              type="range"
              min={1}
              max={100}
              value={quality}
              onChange={(event) => setQuality(Number(event.target.value))}
            />
          </label>

          <button
            type="button"
            onClick={handleConvertAll}
            disabled={isConverting}
            className="w-fit cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg disabled:opacity-60"
          >
            {isConverting ? 'Convirtiendo…' : `Convertir todo (${files.length})`}
          </button>

          {isConverting && (
            <div
              role="progressbar"
              aria-valuenow={doneCount}
              aria-valuemin={0}
              aria-valuemax={files.length}
              className="h-2 overflow-hidden rounded-full bg-surface"
            >
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${(doneCount / files.length) * 100}%` }}
              />
            </div>
          )}

          <ul className="flex flex-col gap-2">
            {files.map((file) => (
              <li
                key={file.path}
                className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm"
              >
                <span className="truncate text-text">{file.name}</span>
                <span className={statusClassName(statuses[file.path])}>
                  {statusLabel(statuses[file.path])}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default ConvertScreen
