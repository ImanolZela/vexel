import { useState } from 'react'
import { useFiles } from '../hooks/useFiles'
import Thumbnail from '../components/Thumbnail'
import Button from '../components/ui/Button'
import Slider from '../components/ui/Slider'
import Checkbox from '../components/ui/Checkbox'
import Card from '../components/ui/Card'
import StatusMessage from '../components/ui/StatusMessage'
import { ConvertIcon } from '../components/icons'
import {
  FORMATS_SUPPORTING_ALPHA,
  FORMATS_WITHOUT_QUALITY,
  IMAGE_FORMATS,
  suggestedFileName,
  type ImageFormat
} from '../lib/imageFormat'
import { THUMBNAIL_SIZE_CLASSES } from '../lib/thumbnailSize'

type FileStatus =
  | { state: 'pending' }
  | { state: 'converting' }
  | { state: 'done'; destPath: string }
  | { state: 'error'; message: string }

function statusLabel(status: FileStatus | undefined): string {
  if (!status || status.state === 'pending') return 'Pendiente'
  if (status.state === 'converting') return 'Convirtiendo…'
  if (status.state === 'done') return 'Listo'
  return status.message
}

function statusClassName(status: FileStatus | undefined): string {
  // *-text tokens: same hue as the mode accent, lightened to actually meet
  // WCAG AA contrast as text (see index.css).
  if (status?.state === 'done') return 'text-convert-text'
  if (status?.state === 'error') return 'text-vectorize-text'
  return 'text-text-secondary'
}

function ConvertScreen(): React.JSX.Element {
  const { files } = useFiles()

  const [format, setFormat] = useState<ImageFormat>('png')
  const [quality, setQuality] = useState(80)
  const [removeBackground, setRemoveBackground] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [statuses, setStatuses] = useState<Record<string, FileStatus>>({})

  const supportsAlpha = FORMATS_SUPPORTING_ALPHA.includes(format)
  const usesQuality = !FORMATS_WITHOUT_QUALITY.includes(format)

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
        quality,
        removeBackground: supportsAlpha && removeBackground
      })

      setStatuses((prev) => ({
        ...prev,
        [file.path]: result.ok
          ? { state: 'done', destPath }
          : { state: 'error', message: result.error }
      }))
    }

    setIsConverting(false)
  }

  return (
    <section className="max-w-2xl" data-testid="screen-convert">
      <div className="mb-2 flex items-center gap-2.5">
        <ConvertIcon className="h-6 w-6 shrink-0 text-[var(--mode-accent)]" />
        <h1 className="m-0 text-2xl font-semibold text-text">Convertir</h1>
      </div>
      <p className="mb-6 text-text-secondary">
        Convertí tus imágenes entre PNG, JPG, WEBP, AVIF, TIFF y GIF.
      </p>

      {files.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-text-secondary/20 py-10 text-center">
          <ConvertIcon className="h-8 w-8 text-text-secondary/50" />
          <StatusMessage tone="info">
            Seleccioná uno o más archivos arriba para convertirlos.
          </StatusMessage>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-text-secondary">Formato destino</span>
              <div className="flex flex-wrap gap-2">
                {IMAGE_FORMATS.map((option) => (
                  <Button
                    key={option}
                    variant="pill"
                    active={format === option}
                    onClick={() => setFormat(option)}
                  >
                    {option.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {usesQuality && (
              <Slider label="Calidad" value={quality} min={1} max={100} onChange={setQuality} />
            )}

            <Checkbox
              label={
                supportsAlpha
                  ? 'Quitar fondo'
                  : 'Quitar fondo (no disponible para JPG, no soporta transparencia)'
              }
              checked={supportsAlpha && removeBackground}
              onChange={setRemoveBackground}
              disabled={!supportsAlpha}
            />

            <Button onClick={handleConvertAll} disabled={isConverting}>
              {isConverting ? 'Convirtiendo…' : `Convertir todo (${files.length})`}
            </Button>

            {isConverting && (
              <div className="flex items-center gap-3">
                <div
                  role="progressbar"
                  aria-valuenow={doneCount}
                  aria-valuemin={0}
                  aria-valuemax={files.length}
                  className="h-2 flex-1 overflow-hidden rounded-full bg-bg"
                >
                  <div
                    className="h-full bg-[var(--mode-accent)] transition-all"
                    style={{ width: `${(doneCount / files.length) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs text-text-secondary">
                  {Math.round((doneCount / files.length) * 100)}%
                </span>
              </div>
            )}
          </Card>

          <Card className="gap-3">
            <p className="mb-0 text-xs font-medium text-text-secondary uppercase">
              Archivos ({files.length})
            </p>

            <ul className="flex flex-col gap-3">
              {files.map((file) => {
                const status = statuses[file.path]
                return (
                  <li
                    key={file.path}
                    className="flex items-center justify-between gap-3 rounded-lg bg-bg px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Thumbnail path={file.path} alt={file.name} size="md" />
                      <span aria-hidden="true" className="text-lg text-text-secondary">
                        →
                      </span>
                      {status?.state === 'done' ? (
                        <Thumbnail
                          path={status.destPath}
                          alt={`${file.name} convertido`}
                          size="md"
                        />
                      ) : (
                        <div
                          className={`${THUMBNAIL_SIZE_CLASSES.md} shrink-0 rounded-md bg-surface`}
                        />
                      )}
                      <span className="truncate text-text">{file.name}</span>
                    </div>
                    <span className={statusClassName(status)}>{statusLabel(status)}</span>
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>
      )}
    </section>
  )
}

export default ConvertScreen
