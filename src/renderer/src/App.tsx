import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dropzone from './components/Dropzone'
import ConvertScreen from './screens/ConvertScreen'
import VectorizeScreen from './screens/VectorizeScreen'
import EnhanceScreen from './screens/EnhanceScreen'
import { FilesProvider } from './state/FilesContext'
import type { Mode } from './types/mode'

function App(): React.JSX.Element {
  const [mode, setMode] = useState<Mode>('convert')

  return (
    <FilesProvider>
      <div id="app-shell" className="flex h-full">
        <Sidebar active={mode} onSelect={setMode} />
        <main className="flex-1 overflow-y-auto px-10 py-8">
          <Dropzone />
          {mode === 'convert' && <ConvertScreen />}
          {mode === 'vectorize' && <VectorizeScreen />}
          {mode === 'enhance' && <EnhanceScreen />}
        </main>
      </div>
    </FilesProvider>
  )
}

export default App
