import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

// Groups a screen's controls into a visually distinct block instead of a
// loose stack of fields sitting directly on the page background — used by
// all three screens for their settings and their preview/result area.
function Card({ children, className = '' }: CardProps): React.JSX.Element {
  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border border-text-secondary/10 bg-surface/60 p-5 ${className}`.trim()}
    >
      {children}
    </div>
  )
}

export default Card
