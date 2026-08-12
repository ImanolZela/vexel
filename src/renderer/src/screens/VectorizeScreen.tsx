import { useEffect, useState } from 'react'
import { useFiles } from '../hooks/useFiles'
import { suggestedSvgFileName } from '../lib/svgFileName'
import { formatBytes } from '../lib/formatBytes'

const DEBOUNCE_MS = 400

interface VectorizeState {
  key: string
  svg: string | null
  error: string | null
}

type ExportStatus =
  { type: 'idle' } | { type: 'success'; path: string } | { type: 'error'; message: string }

function requestKey(path: string, colors: number, turdSize: number, optTolerance: number): string {
  return `${path}|${colors}|${turdSize}|${optTolerance}`
}

function VectorizeScreen(): React.JSX.Element {
  const { files } = useFiles()
  const source = files[0]

  const [colors, setColors] = useState(6)
  const [turdSize, setTurdSize] = useState(2)
  const [optTolerance, setOptTolerance] = useState(0.2)
  const [state, setState] = useState<VectorizeState>({ key: '', svg: null, error: null })
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<ExportStatus>({ type: 'idle' })

  const currentKey = source ? requestKey(source.path, colors, turdSize, optTolerance) : null
  const isLoading = source !== undefined && currentKey !== state.key
  const svg = currentKey === state.key ? state.svg : null
  const error = currentKey === state.key ? state.error : null

  useEffect(() => {
    if (!source) return

    const key = requestKey(source.path, colors, turdSize, optTolerance)

    const timeoutId = window.setTimeout(async () => {
      const result = await window.api.vectorizeImage({
        sourcePath: source.path,
        colors,
        turdSize,
        optTolerance
      })
      setState(
        result.ok ? { key, svg: result.svg, error: null } : { key, svg: null, error: result.error }
      )
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [source, colors, turdSize, optTolerance])

  async function handleExport(): Promise<void> {
    if (!source || !svg) return

    setIsExporting(true)
    const path = await window.api.saveFile(suggestedSvgFileName(source.name))
    if (!path) {
      setIsExporting(false)
      return
    }

    const result = await window.api.writeTextFile(path, svg)
    setExportStatus(
      result.ok ? { type: 'success', path } : { type: 'error', message: result.error }
    )
    setIsExporting(false)
  }

  return (
    <section className="max-w-2xl" data-testid="screen-vectorize">
      <h1 className="mt-0 mb-2 text-2xl font-semibold text-text">Vectorizar</h1>
      <p className="mb-6 text-text-secondary">
        Convertí tus imágenes raster en paths vectoriales reales.
      </p>

      {!source && (
        <p className="text-text-secondary">Seleccioná un archivo arriba para vectorizarlo.</p>
      )}

      {source && (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-text-secondary">
            Colores ({colors})
            <input
              type="range"
              min={2}
              max={16}
              value={colors}
              onChange={(event) => setColors(Number(event.target.value))}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-text-secondary">
            Suavizado ({turdSize})
            <input
              type="range"
              min={0}
              max={10}
              value={turdSize}
              onChange={(event) => setTurdSize(Number(event.target.value))}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-text-secondary">
            Simplificar curvas ({optTolerance.toFixed(1)})
            <input
              type="range"
              min={0.1}
              max={2}
              step={0.1}
              value={optTolerance}
              onChange={(event) => setOptTolerance(Number(event.target.value))}
            />
          </label>

          {isLoading && <p className="text-text-secondary">Vectorizando…</p>}
          {error && <p className="text-vectorize">{error}</p>}

          {svg && (
            <>
              <div
                data-testid="vectorize-preview"
                className="rounded-lg bg-surface p-4"
                dangerouslySetInnerHTML={{ __html: svg }}
              />

              <p className="text-sm text-text-secondary">
                Tamaño: {formatBytes(new Blob([svg]).size)}
              </p>

              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="w-fit cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg disabled:opacity-60"
              >
                {isExporting ? 'Exportando…' : 'Exportar SVG'}
              </button>

              {exportStatus.type === 'success' && (
                <p className="text-convert">Guardado en {exportStatus.path}</p>
              )}
              {exportStatus.type === 'error' && (
                <p className="text-vectorize">{exportStatus.message}</p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}

export default VectorizeScreen
