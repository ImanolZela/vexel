import { useState } from 'react'
import { useFiles } from '../hooks/useFiles'
import { IMAGE_FORMATS, suggestedFileName, type ImageFormat } from '../lib/imageFormat'

type Status =
  { type: 'idle' } | { type: 'success'; message: string } | { type: 'error'; message: string }

function ConvertScreen(): React.JSX.Element {
  const { files } = useFiles()
  const source = files[0]

  const [format, setFormat] = useState<ImageFormat>('png')
  const [quality, setQuality] = useState(80)
  const [isConverting, setIsConverting] = useState(false)
  const [status, setStatus] = useState<Status>({ type: 'idle' })

  async function handleConvert(): Promise<void> {
    if (!source) return

    setIsConverting(true)
    setStatus({ type: 'idle' })

    const destPath = await window.api.saveFile(suggestedFileName(source.name, format))
    if (!destPath) {
      setIsConverting(false)
      return
    }

    const result = await window.api.convertImage({
      sourcePath: source.path,
      destPath,
      format,
      quality
    })

    setStatus(
      result.ok
        ? { type: 'success', message: `Guardado en ${destPath}` }
        : { type: 'error', message: result.error }
    )
    setIsConverting(false)
  }

  return (
    <section className="max-w-2xl" data-testid="screen-convert">
      <h1 className="mt-0 mb-2 text-2xl font-semibold text-text">Convertir</h1>
      <p className="mb-6 text-text-secondary">
        Convertí tus imágenes entre PNG, JPG, WEBP, AVIF, TIFF y GIF.
      </p>

      {!source && (
        <p className="text-text-secondary">Seleccioná un archivo arriba para convertirlo.</p>
      )}

      {source && (
        <div className="flex flex-col gap-4">
          <p className="text-text">{source.name}</p>

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
            onClick={handleConvert}
            disabled={isConverting}
            className="w-fit cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg disabled:opacity-60"
          >
            {isConverting ? 'Convirtiendo…' : 'Convertir'}
          </button>

          {status.type === 'success' && <p className="text-convert">{status.message}</p>}
          {status.type === 'error' && <p className="text-vectorize">{status.message}</p>}
        </div>
      )}
    </section>
  )
}

export default ConvertScreen
