// Small, original line icons for the three modes — hand-drawn rather than
// pulled from an icon library, to keep the app dependency-free (matching
// the hand-built logo/palette already in the project) for just three
// glyphs. All inherit color from their container via currentColor, so
// they pick up the existing active/hover/mode-accent styling for free.

interface IconProps {
  className?: string
}

const BASE_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const
}

// Two arrows chasing each other in a loop — format A becoming format B
// and back, the core idea of Convertir.
export function ConvertIcon({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M4 7h13l-3-3" />
      <path d="M20 17H7l3 3" />
    </svg>
  )
}

// A path with anchor points — the literal thing Vectorizar produces:
// real bezier paths, not a raster wrapped in a box.
export function VectorizeIcon({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M4 18C7 10 10 6 20 5" />
      <circle cx="4" cy="18" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="20" cy="5" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

// A four-point sparkle — the shorthand for "made better" across most
// design systems, used here for Mejorar.
export function EnhanceIcon({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8c0 2.2-1.8 4-4 4 2.2 0 4 1.8 4 4 0-2.2 1.8-4 4-4-2.2 0-4-1.8-4-4Z" />
    </svg>
  )
}

// Generic — not tied to a mode, used by the shared Dropzone.
export function UploadIcon({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M12 15V4M12 4 8 8M12 4l4 4" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

// Sidebar trigger for the history panel.
export function HistoryIcon({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v4.5H7.5" />
      <path d="M12 8v4l3 2" />
    </svg>
  )
}

// Sidebar trigger for the settings panel — a simplified gear: a hub circle
// with six radial ticks, safer to hand-author correctly than a full
// interlocking gear outline.
export function SettingsIcon({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M21 12h2M16.5 19.79l1 1.74M7.5 19.79l-1 1.74M3 12H1M7.5 4.21l-1-1.74M16.5 4.21l1-1.74" />
    </svg>
  )
}

// Small "x" for removing a single history entry, and a folder glyph for
// "show this file in its folder".
export function FolderIcon({ className }: IconProps): React.JSX.Element {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M3 6a1 1 0 0 1 1-1h4l2 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
    </svg>
  )
}
