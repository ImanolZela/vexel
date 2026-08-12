import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ConvertScreen from './screens/ConvertScreen'
import VectorizeScreen from './screens/VectorizeScreen'
import EnhanceScreen from './screens/EnhanceScreen'
import type { Mode } from './types/mode'

function App(): React.JSX.Element {
  const [mode, setMode] = useState<Mode>('convert')

  return (
    <div id="app-shell">
      <Sidebar active={mode} onSelect={setMode} />
      <main className="content">
        {mode === 'convert' && <ConvertScreen />}
        {mode === 'vectorize' && <VectorizeScreen />}
        {mode === 'enhance' && <EnhanceScreen />}
      </main>
    </div>
  )
}

export default App
