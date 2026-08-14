import { useEffect, useState } from 'react'
import { useFiles } from '../hooks/useFiles'
import Thumbnail from '../components/Thumbnail'
import Button from '../components/ui/Button'
import Slider from '../components/ui/Slider'
import Checkbox from '../components/ui/Checkbox'
import Card from '../components/ui/Card'
import StatusMessage from '../components/ui/StatusMessage'
import { EnhanceIcon } from '../components/icons'
import { suggestedEnhancedFileName } from '../lib/enhancedFileName'
import { ENHANCE_PRESETS } from '../lib/enhancePresets'
import { THUMBNAIL_SIZE_CLASSES } from '../lib/thumbnailSize'

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

function isActivePreset(options: EnhanceOptionsState, presetOptions: EnhanceOptionsState): boolean {
  return (
    options.autoContrast === presetOptions.autoContrast &&
    options.denoise === presetOptions.denoise &&
    options.sharpen === presetOptions.sharpen &&
    options.scale === presetOptions.scale
  )
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
    const { defaultDownloadDir } = await window.api.getSettings()
    const suggestedName = suggestedEnhancedFileName(source.name)
    const defaultPath = defaultDownloadDir
      ? window.api.joinPath(defaultDownloadDir, suggestedName)
      : suggestedName
    const destPath = await window.api.saveFile(defaultPath)
    if (!destPath) {
      setIsSaving(false)
      return
    }

    const result = await window.api.enhanceImage({ sourcePath: source.path, destPath, ...options })
    setSaveStatus(
      result.ok ? { type: 'success', path: destPath } : { type: 'error', message: result.error }
    )
    if (result.ok) {
      window.api.addHistoryEntry({ kind: 'enhance', sourceName: source.name, destPath })
    }
    setIsSaving(false)
  }

  return (
    <section className="max-w-5xl" data-testid="screen-enhance">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--mode-accent)]/15">
          <EnhanceIcon className="h-5 w-5 text-[var(--mode-accent)]" />
        </div>
        <h1 className="m-0 text-2xl font-semibold text-text">Mejorar</h1>
      </div>
      <p className="mb-6 text-text-secondary">
        Nitidez, reducción de ruido, auto-contraste y upscale sin depender de la nube.
      </p>

      {!source && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-text-secondary/20 py-10 text-center">
          <EnhanceIcon className="h-8 w-8 text-text-secondary/50" />
          <StatusMessage tone="info">Seleccioná un archivo arriba para mejorarlo.</StatusMessage>
        </div>
      )}

      {source && (
        // Same fixed-settings / flexible-preview split as Vectorizar — and
        // the extra room in the right column on a wide window goes to
        // showing the before/after thumbnails bigger (lg, not md).
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[340px_1fr]">
          <Card>
            <div className="flex flex-wrap gap-2">
              {ENHANCE_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  variant="pill"
                  active={isActivePreset(options, preset.options)}
                  onClick={() => setOptions(preset.options)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            <Checkbox
              label="Nitidez"
              checked={options.sharpen}
              onChange={(checked) => setOptions({ ...options, sharpen: checked })}
            />

            <Checkbox
              label="Reducción de ruido"
              checked={options.denoise}
              onChange={(checked) => setOptions({ ...options, denoise: checked })}
            />

            <Checkbox
              label="Auto-contraste"
              checked={options.autoContrast}
              onChange={(checked) => setOptions({ ...options, autoContrast: checked })}
            />

            <Slider
              label="Escala"
              value={options.scale}
              min={1}
              max={4}
              step={0.5}
              formatValue={(value) => `${value.toFixed(1)}x`}
              onChange={(value) => setOptions({ ...options, scale: value })}
            />
          </Card>

          <Card>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className="mb-1 text-xs text-text-secondary">Antes</p>
                <Thumbnail path={source.path} alt={`${source.name} original`} size="lg" />
              </div>
              <span aria-hidden="true" className="mb-4 text-xl text-text-secondary">
                →
              </span>
              <div>
                <p className="mb-1 text-xs text-text-secondary">Después</p>
                <div
                  className={`flex ${THUMBNAIL_SIZE_CLASSES.lg} shrink-0 items-center justify-center overflow-hidden rounded-md bg-bg`}
                >
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

            {isLoading && <StatusMessage tone="info">Generando preview…</StatusMessage>}
            {previewError && <StatusMessage tone="error">{previewError}</StatusMessage>}

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar'}
            </Button>

            {saveStatus.type === 'success' && (
              <StatusMessage tone="success">Guardado en {saveStatus.path}</StatusMessage>
            )}
            {saveStatus.type === 'error' && (
              <StatusMessage tone="error">{saveStatus.message}</StatusMessage>
            )}
          </Card>
        </div>
      )}
    </section>
  )
}

export default EnhanceScreen
