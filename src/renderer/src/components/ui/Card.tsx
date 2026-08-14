import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

// Groups a screen's controls into a visually distinct block instead of a
// loose stack of fields sitting directly on the page background — used by
// all three screens for their settings and their preview/result area. The
// left border in the active mode's color echoes the same "this belongs to
// X mode" language the sidebar's active item already uses.
function Card({ children, className = '' }: CardProps): React.JSX.Element {
  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border border-l-4 border-text-secondary/10 border-l-[var(--mode-accent)] bg-surface/60 p-5 ${className}`.trim()}
    >
      {children}
    </div>
  )
}

export default Card
