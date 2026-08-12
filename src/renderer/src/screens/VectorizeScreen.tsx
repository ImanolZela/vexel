import { useEffect, useState } from 'react'
import { useFiles } from '../hooks/useFiles'
import Button from '../components/ui/Button'
import Slider from '../components/ui/Slider'
import StatusMessage from '../components/ui/StatusMessage'
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
        <StatusMessage tone="info">Seleccioná un archivo arriba para vectorizarlo.</StatusMessage>
      )}

      {source && (
        <div className="flex flex-col gap-4">
          <Slider label="Colores" value={colors} min={2} max={16} onChange={setColors} />

          <Slider label="Suavizado" value={turdSize} min={0} max={10} onChange={setTurdSize} />

          <Slider
            label="Simplificar curvas"
            value={optTolerance}
            min={0.1}
            max={2}
            step={0.1}
            formatValue={(value) => value.toFixed(1)}
            onChange={setOptTolerance}
          />

          {isLoading && <StatusMessage tone="info">Vectorizando…</StatusMessage>}
          {error && <StatusMessage tone="error">{error}</StatusMessage>}

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

              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? 'Exportando…' : 'Exportar SVG'}
              </Button>

              {exportStatus.type === 'success' && (
                <StatusMessage tone="success">Guardado en {exportStatus.path}</StatusMessage>
              )}
              {exportStatus.type === 'error' && (
                <StatusMessage tone="error">{exportStatus.message}</StatusMessage>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}

export default VectorizeScreen
