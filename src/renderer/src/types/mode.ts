export type Mode = 'convert' | 'vectorize' | 'enhance'

export interface ModeInfo {
  id: Mode
  label: string
  accent: string
  // Text color for content placed directly on `accent` (buttons, progress
  // fills). Verde oliva and terracota are mid-toned enough that neither a
  // fixed dark nor fixed light button-text color passes WCAG AA against
  // all three mode colors — each mode picks whichever actually does.
  onAccent: string
}

export const MODES: ModeInfo[] = [
  {
    id: 'convert',
    label: 'Convertir',
    accent: 'var(--color-convert)',
    onAccent: 'var(--color-text)'
  },
  {
    id: 'vectorize',
    label: 'Vectorizar',
    accent: 'var(--color-vectorize)',
    onAccent: 'var(--color-text)'
  },
  {
    id: 'enhance',
    label: 'Mejorar',
    accent: 'var(--color-accent)',
    onAccent: 'var(--color-on-accent)'
  }
]
