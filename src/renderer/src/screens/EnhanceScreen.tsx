import { useEffect, useState } from 'react'
import { useFiles } from '../hooks/useFiles'
import Thumbnail from '../components/Thumbnail'
import { suggestedEnhancedFileName } from '../lib/enhancedFileName'
import { ENHANCE_PRESETS } from '../lib/enhancePresets'

const DEBOUNCE_MS = 400

interface EnhanceOptionsState {
  autoContrast: boolean
  denoise: boolean
  sharpen: boolean
  scale: number
}

interface PreviewState {
  key: string
  thumbnail: string | null
  error: string | null
}

type SaveStatus =
  { type: 'idle' } | { type: 'success'; path: string } | { type: 'error'; message: string }

function requestKey(path: string, options: EnhanceOptionsState): string {
  return `${path}|${options.autoContrast}|${options.denoise}|${options.sharpen}|${options.scale}`
}

function EnhanceScreen(): React.JSX.Element {
  const { files } = useFiles()
  const source = files[0]

  const [options, setOptions] = useState<EnhanceOptionsState>({
    autoContrast: false,
    denoise: false,
    sharpen: false,
    scale: 1
  })
  const [preview, setPreview] = useState<PreviewState>({ key: '', thumbnail: null, error: null })
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ type: 'idle' })

  const currentKey = source ? requestKey(source.path, options) : null
  const isLoading = source !== undefined && currentKey !== preview.key
  const afterThumbnail = currentKey === preview.key ? preview.thumbnail : null
  const previewError = currentKey === preview.key ? preview.error : null

  useEffect(() => {
    if (!source) return

    const key = requestKey(source.path, options)

    const timeoutId = window.setTimeout(async () => {
      const result = await window.api.enhancePreview({ sourcePath: source.path, ...options })
      setPreview(
        result.ok
          ? { key, thumbnail: result.thumbnail, error: null }
          : { key, thumbnail: null, error: result.error }
      )
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [source, options])

  async function handleSave(): Promise<void> {
    if (!source) return

    setIsSaving(true)
    const destPath = await window.api.saveFile(suggestedEnhancedFileName(source.name))
    if (!destPath) {
      setIsSaving(false)
      return
    }

    const result = await window.api.enhanceImage({ sourcePath: source.path, destPath, ...options })
    setSaveStatus(
      result.ok ? { type: 'success', path: destPath } : { type: 'error', message: result.error }
    )
    setIsSaving(false)
  }

  return (
    <section className="max-w-2xl" data-testid="screen-enhance">
      <h1 className="mt-0 mb-2 text-2xl font-semibold text-text">Mejorar</h1>
      <p className="mb-6 text-text-secondary">
        Nitidez, reducción de ruido, auto-contraste y upscale sin depender de la nube.
      </p>

      {!source && (
        <p className="text-text-secondary">Seleccioná un archivo arriba para mejorarlo.</p>
      )}

      {source && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {ENHANCE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                data-active={
                  options.autoContrast === preset.options.autoContrast &&
                  options.denoise === preset.options.denoise &&
                  options.sharpen === preset.options.sharpen &&
                  options.scale === preset.options.scale
                }
                onClick={() => setOptions(preset.options)}
                className="cursor-pointer rounded-full border border-text-secondary/30 px-3 py-1 text-sm text-text-secondary data-[active=true]:border-accent data-[active=true]:text-text"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={options.sharpen}
              onChange={(event) => setOptions({ ...options, sharpen: event.target.checked })}
            />
            Nitidez
          </label>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={options.denoise}
              onChange={(event) => setOptions({ ...options, denoise: event.target.checked })}
            />
            Reducción de ruido
          </label>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={options.autoContrast}
              onChange={(event) => setOptions({ ...options, autoContrast: event.target.checked })}
            />
            Auto-contraste
          </label>

          <label className="flex flex-col gap-1 text-sm text-text-secondary">
            Escala ({options.scale.toFixed(1)}x)
            <input
              type="range"
              min={1}
              max={4}
              step={0.5}
              value={options.scale}
              onChange={(event) => setOptions({ ...options, scale: Number(event.target.value) })}
            />
          </label>

          <div className="flex items-center gap-4">
            <div>
              <p className="mb-1 text-xs text-text-secondary">Antes</p>
              <Thumbnail path={source.path} alt={`${source.name} original`} />
            </div>
            <div>
              <p className="mb-1 text-xs text-text-secondary">Después</p>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-bg">
                {afterThumbnail && (
                  <img
                    src={afterThumbnail}
                    alt={`${source.name} mejorado`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {isLoading && <p className="text-text-secondary">Generando preview…</p>}
          {previewError && <p className="text-vectorize">{previewError}</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-fit cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg disabled:opacity-60"
          >
            {isSaving ? 'Guardando…' : 'Guardar'}
          </button>

          {saveStatus.type === 'success' && (
            <p className="text-convert">Guardado en {saveStatus.path}</p>
          )}
          {saveStatus.type === 'error' && <p className="text-vectorize">{saveStatus.message}</p>}
        </div>
      )}
    </section>
  )
}

export default EnhanceScreen
