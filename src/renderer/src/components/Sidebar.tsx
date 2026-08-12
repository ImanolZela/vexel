import { MODES, type Mode } from '../types/mode'

interface SidebarProps {
  active: Mode
  onSelect: (mode: Mode) => void
}

function Sidebar({ active, onSelect }: SidebarProps): React.JSX.Element {
  return (
    <nav className="sidebar" aria-label="Modos de Vexel">
      <div className="sidebar-brand">Vexel</div>
      <ul className="sidebar-list">
        {MODES.map((mode) => (
          <li key={mode.id}>
            <button
              type="button"
              className="sidebar-item"
              data-active={mode.id === active}
              style={{ '--mode-accent': mode.accent } as React.CSSProperties}
              onClick={() => onSelect(mode.id)}
            >
              {mode.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Sidebar
