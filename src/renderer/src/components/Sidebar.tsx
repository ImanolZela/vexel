import { MODES, type Mode } from '../types/mode'

interface SidebarProps {
  active: Mode
  onSelect: (mode: Mode) => void
}

function Sidebar({ active, onSelect }: SidebarProps): React.JSX.Element {
  return (
    <nav className="w-56 shrink-0 bg-surface border-r border-text-secondary/20 flex flex-col p-4">
      <div className="font-bold text-lg text-accent px-3 pb-5">Vexel</div>
      <ul className="flex flex-col gap-1 list-none m-0 p-0">
        {MODES.map((mode) => (
          <li key={mode.id}>
            <button
              type="button"
              data-active={mode.id === active}
              style={{ '--mode-accent': mode.accent } as React.CSSProperties}
              className={`w-full cursor-pointer rounded-lg border-l-[3px] px-3 py-2.5 text-left text-sm transition-colors ${
                mode.id === active
                  ? 'border-l-[var(--mode-accent)] bg-text-secondary/10 text-text'
                  : 'border-transparent text-text-secondary hover:bg-text-secondary/10 hover:text-text'
              }`}
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
