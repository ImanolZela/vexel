import { useEffect, useState } from 'react'
import { useFiles } from '../hooks/useFiles'

const DEBOUNCE_MS = 400

interface VectorizeState {
  key: string
  svg: string | null
  error: string | null
}

function requestKey(path: string, colors: number, turdSize: number): string {
  return `${path}|${colors}|${turdSize}`
}

function VectorizeScreen(): React.JSX.Element {
  const { files } = useFiles()
  const source = files[0]

  const [colors, setColors] = useState(6)
  const [turdSize, setTurdSize] = useState(2)
  const [state, setState] = useState<VectorizeState>({ key: '', svg: null, error: null })

  const currentKey = source ? requestKey(source.path, colors, turdSize) : null
  const isLoading = source !== undefined && currentKey !== state.key
  const svg = currentKey === state.key ? state.svg : null
  const error = currentKey === state.key ? state.error : null

  useEffect(() => {
    if (!source) return

    const key = requestKey(source.path, colors, turdSize)

    const timeoutId = window.setTimeout(async () => {
      const result = await window.api.vectorizeImage({ sourcePath: source.path, colors, turdSize })
      setState(
        result.ok ? { key, svg: result.svg, error: null } : { key, svg: null, error: result.error }
      )
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [source, colors, turdSize])

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

          {isLoading && <p className="text-text-secondary">Vectorizando…</p>}
          {error && <p className="text-vectorize">{error}</p>}

          {svg && (
            <div
              data-testid="vectorize-preview"
              className="rounded-lg bg-surface p-4"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>
      )}
    </section>
  )
}

export default VectorizeScreen
