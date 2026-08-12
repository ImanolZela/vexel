export type Mode = 'convert' | 'vectorize' | 'enhance'

export interface ModeInfo {
  id: Mode
  label: string
  accent: string
}

export const MODES: ModeInfo[] = [
  { id: 'convert', label: 'Convertir', accent: 'var(--color-convert)' },
  { id: 'vectorize', label: 'Vectorizar', accent: 'var(--color-vectorize)' },
  { id: 'enhance', label: 'Mejorar', accent: 'var(--color-accent)' }
]
