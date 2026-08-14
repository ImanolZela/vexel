import { MODES, type Mode } from '../types/mode'
import { MODE_ICONS } from '../lib/modeIcons'

interface SidebarProps {
  active: Mode
  onSelect: (mode: Mode) => void
}

function Sidebar({ active, onSelect }: SidebarProps): React.JSX.Element {
  return (
    <nav className="w-56 shrink-0 bg-surface border-r border-text-secondary/20 flex flex-col p-4">
      <div className="font-bold text-lg text-accent px-3 pb-5">Vexel</div>
      <ul className="flex flex-col gap-1 list-none m-0 p-0">
        {MODES.map((mode) => {
          const Icon = MODE_ICONS[mode.id]
          return (
            <li key={mode.id}>
              <button
                type="button"
                data-active={mode.id === active}
                style={{ '--mode-accent': mode.accent } as React.CSSProperties}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-l-[3px] px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mode-accent)] ${
                  mode.id === active
                    ? 'border-l-[var(--mode-accent)] bg-text-secondary/10 text-text'
                    : 'border-l-[var(--mode-accent)]/30 text-text-secondary hover:border-l-[var(--mode-accent)]/70 hover:bg-text-secondary/10 hover:text-text'
                }`}
                onClick={() => onSelect(mode.id)}
              >
                {/* Icon keeps its own mode color even when inactive — Mejorar's
                    neutral accent is the exception, so all three colors in
                    the palette actually show up together, not just whichever
                    mode happens to be selected. */}
                <Icon className="h-4 w-4 shrink-0 text-[var(--mode-accent)]" />
                {mode.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default Sidebar
