import { useEffect, useState } from 'react'
import { useFiles } from '../hooks/useFiles'
import Button from '../components/ui/Button'
import Slider from '../components/ui/Slider'
import Checkbox from '../components/ui/Checkbox'
import Card from '../components/ui/Card'
import StatusMessage from '../components/ui/StatusMessage'
import FilePicker from '../components/FilePicker'
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
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  // Falls back to the first file automatically if the selected one was
  // removed (or none was picked yet) — self-healing, no extra effect needed.
  const source = files.find((file) => file.path === selectedPath) ?? files[0]

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
    // A configured default download folder just pre-fills where the save
    // dialog opens — unlike Convertir's batch save, exporting one SVG still
    // benefits from confirming/renaming the exact file each time.
    const { defaultDownloadDir } = await window.api.getSettings()
    const suggestedName = suggestedSvgFileName(source.name)
    const defaultPath = defaultDownloadDir
      ? window.api.joinPath(defaultDownloadDir, suggestedName)
      : suggestedName
    const path = await window.api.saveFile(defaultPath)
    if (!path) {
      setIsExporting(false)
      return
    }

    const result = await window.api.writeTextFile(path, svg)
    setExportStatus(
      result.ok ? { type: 'success', path } : { type: 'error', message: result.error }
    )
    if (result.ok) {
      window.api.addHistoryEntry({
        kind: 'vectorize',
        sourceName: source.name,
        destPath: path,
        format: 'svg'
      })
    }
    setIsExporting(false)
  }

  return (
    <section className="max-w-5xl" data-testid="screen-vectorize">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--mode-accent)]/15">
          <VectorizeIcon className="h-5 w-5 text-[var(--mode-accent)]" />
        </div>
        <h1 className="m-0 text-2xl font-semibold text-text">Vectorizar</h1>
      </div>
      <p className="mb-6 text-text-secondary">
        Convertí tus imágenes raster en paths vectoriales reales.
      </p>

      {source && <FilePicker files={files} selectedPath={source.path} onSelect={setSelectedPath} />}

      {!source && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-text-secondary/20 py-10 text-center">
          <VectorizeIcon className="h-8 w-8 text-text-secondary/50" />
          <StatusMessage tone="info">Seleccioná un archivo arriba para vectorizarlo.</StatusMessage>
        </div>
      )}

      {source && (
        // Settings pinned to a fixed-width column, preview taking the rest —
        // on a narrow window (below the lg breakpoint) it stacks instead, so
        // a wide window doesn't just leave the extra space empty.
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[340px_1fr]">
          <Card>
            <Slider
              label="Colores"
              hint="Cantidad de colores en la paleta del SVG resultante. Menos colores dan un resultado más plano y liviano."
              value={colors}
              min={2}
              max={16}
              onChange={setColors}
            />

            <Slider
              label="Suavizado"
              hint="Descarta manchas y detalles muy pequeños. Valores altos simplifican la imagen y limpian el ruido."
              value={turdSize}
              min={0}
              max={10}
              onChange={setTurdSize}
            />

            <Slider
              label="Simplificar curvas"
              hint="Qué tanto se suavizan los trazos. Valores altos generan paths más simples, con menos puntos, pero menos fieles al original."
              value={optTolerance}
              min={0.1}
              max={2}
              step={0.1}
              formatValue={(value) => value.toFixed(1)}
              onChange={setOptTolerance}
            />

            <Checkbox
              label="Quitar fondo"
              hint="Detecta el color de fondo por las esquinas de la imagen y lo excluye del trazado."
              checked={removeBackground}
              onChange={setRemoveBackground}
            />
          </Card>

          <div className="flex flex-col gap-4">
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
        </div>
      )}
    </section>
  )
}

export default VectorizeScreen
