import type { ReactNode } from 'react'

type StatusTone = 'success' | 'error' | 'info'

interface StatusMessageProps {
  tone: StatusTone
  children: ReactNode
}

const TONE_CLASSES: Record<StatusTone, string> = {
  success: 'text-convert',
  error: 'text-vectorize',
  info: 'text-text-secondary'
}

function StatusMessage({ tone, children }: StatusMessageProps): React.JSX.Element {
  return <p className={TONE_CLASSES[tone]}>{children}</p>
}

export default StatusMessage
