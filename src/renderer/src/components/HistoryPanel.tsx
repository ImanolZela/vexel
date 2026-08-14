import { useEffect, useState } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import StatusMessage from './ui/StatusMessage'
import { HistoryIcon, FolderIcon } from './icons'
import { MODE_ICONS } from '../lib/modeIcons'
import { MODES } from '../types/mode'
import { fileNameFromPath } from '../lib/path'
import { formatRelativeTime } from '../lib/relativeTime'

interface HistoryPanelProps {
  onClose: () => void
}

// window.api.getHistory()'s return type, derived rather than duplicated or
// imported across the main/renderer process boundary (see api.d.ts).
type HistoryEntry = Awaited<ReturnType<typeof window.api.getHistory>>[number]

function accentFor(kind: HistoryEntry['kind']): string {
  return MODES.find((mode) => mode.id === kind)?.accent ?? 'var(--color-accent)'
}

function HistoryPanel({ onClose }: HistoryPanelProps): React.JSX.Element {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null)

  useEffect(() => {
    let cancelled = false
    window.api.getHistory().then((result) => {
      if (!cancelled) setEntries(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleRemove(id: string): Promise<void> {
    setEntries(await window.api.removeHistoryEntry(id))
  }

  async function handleClear(): Promise<void> {
    await window.api.clearHistory()
    setEntries([])
  }

  return (
    <Modal title="Historial de descargas" onClose={onClose}>
      {entries === null && <StatusMessage tone="info">Cargando…</StatusMessage>}

      {entries?.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <HistoryIcon className="h-7 w-7 text-text-secondary/50" />
          <StatusMessage tone="info">
            Todavía no convertiste, vectorizaste ni mejoraste nada.
          </StatusMessage>
        </div>
      )}

      {entries && entries.length > 0 && (
        <>
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => {
              const Icon = MODE_ICONS[entry.kind]
              return (
                <li
                  key={entry.id}
                  style={{ '--mode-accent': accentFor(entry.kind) } as React.CSSProperties}
                  className="flex items-center gap-3 rounded-lg bg-bg px-3 py-2 text-sm"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--mode-accent)]/15">
                    <Icon className="h-4 w-4 text-[var(--mode-accent)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-text">{fileNameFromPath(entry.destPath)}</p>
                    <p className="m-0 truncate text-xs text-text-secondary">
                      {entry.sourceName} · {formatRelativeTime(entry.timestamp)}
                    </p>
                  </div>
                  <button
                    type="button"
                    title="Mostrar en carpeta"
                    aria-label={`Mostrar ${entry.destPath} en su carpeta`}
                    onClick={() => window.api.showInFolder(entry.destPath)}
                    className="shrink-0 cursor-pointer rounded-md p-1.5 text-text-secondary hover:bg-text-secondary/10 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mode-accent)]"
                  >
                    <FolderIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Quitar del historial"
                    aria-label={`Quitar ${entry.destPath} del historial`}
                    onClick={() => handleRemove(entry.id)}
                    className="shrink-0 cursor-pointer rounded-md px-2 py-1 text-text-secondary hover:bg-text-secondary/10 hover:text-vectorize-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mode-accent)]"
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>

          <Button variant="pill" onClick={handleClear} className="self-start">
            Limpiar historial
          </Button>
        </>
      )}
    </Modal>
  )
}

export default HistoryPanel
