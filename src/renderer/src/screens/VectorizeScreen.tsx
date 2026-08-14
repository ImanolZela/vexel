import { useEffect, useState } from 'react'
import { useFiles } from '../hooks/useFiles'
import Button from '../components/ui/Button'
import Slider from '../components/ui/Slider'
import Checkbox from '../components/ui/Checkbox'
import Card from '../components/ui/Card'
import StatusMessage from '../components/ui/StatusMessage'
import { VectorizeIcon } from '../components/icons'
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

function requestKey(
  path: string,
  colors: number,
  turdSize: number,
  optTolerance: number,
  removeBackground: boolean
): string {
  return `${path}|${colors}|${turdSize}|${optTolerance}|${removeBackground}`
}

function VectorizeScreen(): React.JSX.Element {
  const { files } = useFiles()
  const source = files[0]

  const [colors, setColors] = useState(12)
  const [turdSize, setTurdSize] = useState(2)
  const [optTolerance, setOptTolerance] = useState(0.2)
  const [removeBackground, setRemoveBackground] = useState(false)
  const [state, setState] = useState<VectorizeState>({ key: '', svg: null, error: null })
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<ExportStatus>({ type: 'idle' })

  const currentKey = source
    ? requestKey(source.path, colors, turdSize, optTolerance, removeBackground)
    : null
  const isLoading = source !== undefined && currentKey !== state.key
  const svg = currentKey === state.key ? state.svg : null
  const error = currentKey === state.key ? state.error : null

  useEffect(() => {
    if (!source) return

    const key = requestKey(source.path, colors, turdSize, optTolerance, removeBackground)

    const timeoutId = window.setTimeout(async () => {
      const result = await window.api.vectorizeImage({
        sourcePath: source.path,
        colors,
        turdSize,
        optTolerance,
        removeBackground
      })
      setState(
        result.ok ? { key, svg: result.svg, error: null } : { key, svg: null, error: result.error }
      )
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [source, colors, turdSize, optTolerance, removeBackground])

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
      <div className="mb-2 flex items-center gap-2.5">
        <VectorizeIcon className="h-6 w-6 shrink-0 text-[var(--mode-accent)]" />
        <h1 className="m-0 text-2xl font-semibold text-text">Vectorizar</h1>
      </div>
      <p className="mb-6 text-text-secondary">
        Convertí tus imágenes raster en paths vectoriales reales.
      </p>

      {!source && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-text-secondary/20 py-10 text-center">
          <VectorizeIcon className="h-8 w-8 text-text-secondary/50" />
          <StatusMessage tone="info">Seleccioná un archivo arriba para vectorizarlo.</StatusMessage>
        </div>
      )}

      {source && (
        <div className="flex flex-col gap-4">
          <Card>
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

            <Checkbox
              label="Quitar fondo"
              checked={removeBackground}
              onChange={setRemoveBackground}
            />
          </Card>

          {isLoading && <StatusMessage tone="info">Vectorizando…</StatusMessage>}
          {error && <StatusMessage tone="error">{error}</StatusMessage>}

          {svg && (
            <Card>
              <div
                data-testid="vectorize-preview"
                className="rounded-lg bg-bg p-4"
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
            </Card>
          )}
        </div>
      )}
    </section>
  )
}

export default VectorizeScreen
