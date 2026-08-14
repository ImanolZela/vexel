import { useEffect, useState } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import StatusMessage from './ui/StatusMessage'

interface SettingsPanelProps {
  onClose: () => void
}

// window.api.getSettings()'s return type, derived rather than duplicated or
// imported across the main/renderer process boundary (see api.d.ts).
type Settings = Awaited<ReturnType<typeof window.api.getSettings>>

function SettingsPanel({ onClose }: SettingsPanelProps): React.JSX.Element {
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    let cancelled = false
    window.api.getSettings().then((result) => {
      if (!cancelled) setSettings(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleChooseDir(): Promise<void> {
    const dir = await window.api.chooseDirectory()
    if (!dir) return
    setSettings(await window.api.updateSettings({ defaultDownloadDir: dir }))
  }

  async function handleClearDir(): Promise<void> {
    setSettings(await window.api.updateSettings({ defaultDownloadDir: null }))
  }

  return (
    <Modal title="Configuración" onClose={onClose}>
      {!settings && <StatusMessage tone="info">Cargando…</StatusMessage>}

      {settings && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text">Carpeta de descarga</span>
          <p className="m-0 text-xs text-text-secondary">
            Convertir guarda ahí directamente sin preguntar cada vez. Vectorizar y Mejorar la usan
            como punto de partida al elegir dónde guardar.
          </p>

          <div className="flex items-center justify-between gap-3 rounded-lg bg-bg px-3 py-2">
            <span
              className={`min-w-0 flex-1 truncate text-sm ${settings.defaultDownloadDir ? 'text-text' : 'text-text-secondary italic'}`}
              title={settings.defaultDownloadDir ?? undefined}
            >
              {settings.defaultDownloadDir ?? 'Preguntar cada vez'}
            </span>
            {settings.defaultDownloadDir && (
              <button
                type="button"
                onClick={handleClearDir}
                className="shrink-0 cursor-pointer text-xs text-text-secondary hover:text-vectorize-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mode-accent)]"
              >
                Quitar
              </button>
            )}
          </div>

          <Button variant="pill" onClick={handleChooseDir} className="self-start">
            {settings.defaultDownloadDir ? 'Cambiar carpeta…' : 'Elegir carpeta…'}
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default SettingsPanel
