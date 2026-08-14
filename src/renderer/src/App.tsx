import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dropzone from './components/Dropzone'
import HistoryPanel from './components/HistoryPanel'
import SettingsPanel from './components/SettingsPanel'
import ConvertScreen from './screens/ConvertScreen'
import VectorizeScreen from './screens/VectorizeScreen'
import EnhanceScreen from './screens/EnhanceScreen'
import { FilesProvider } from './state/FilesContext'
import { useFileDrop } from './hooks/useFileDrop'
import { MODES, type Mode } from './types/mode'

type OverlayPanel = 'none' | 'history' | 'settings'

function AppShell(): React.JSX.Element {
  const [mode, setMode] = useState<Mode>('convert')
  const [panel, setPanel] = useState<OverlayPanel>('none')
  const { isDragging, onDragEnter, onDragOver, onDragLeave, onDrop } = useFileDrop()
  const modeInfo = MODES.find((m) => m.id === mode)

  return (
    <div
      id="app-shell"
      className="relative flex h-full"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={
        {
          '--mode-accent': modeInfo?.accent ?? 'var(--color-accent)',
          '--mode-on-accent': modeInfo?.onAccent ?? 'var(--color-on-accent)'
        } as React.CSSProperties
      }
    >
      <Sidebar
        active={mode}
        onSelect={setMode}
        onOpenHistory={() => setPanel('history')}
        onOpenSettings={() => setPanel('settings')}
      />
      <main className="flex-1 overflow-y-auto px-10 py-8">
        <Dropzone />
        <div key={mode} className="animate-[screen-fade-in_180ms_ease-out]">
          {mode === 'convert' && <ConvertScreen />}
          {mode === 'vectorize' && <VectorizeScreen />}
          {mode === 'enhance' && <EnhanceScreen />}
        </div>
      </main>

      {isDragging && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-accent/10">
          <p className="rounded-lg bg-bg/90 px-6 py-3 text-lg font-medium text-text">
            Soltá para agregar imágenes
          </p>
        </div>
      )}

      {panel === 'history' && <HistoryPanel onClose={() => setPanel('none')} />}
      {panel === 'settings' && <SettingsPanel onClose={() => setPanel('none')} />}
    </div>
  )
}

function App(): React.JSX.Element {
  return (
    <FilesProvider>
      <AppShell />
    </FilesProvider>
  )
}

export default App
