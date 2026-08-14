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

// Errors interrupt (assertive); success/info just get announced once
// current speech finishes (polite) — same convention as role="alert" vs
// role="status" everywhere else. Without this, a screen reader user gets
// no signal at all when a conversion finishes or fails.
const TONE_ROLE: Record<StatusTone, 'alert' | 'status'> = {
  success: 'status',
  error: 'alert',
  info: 'status'
}

function StatusMessage({ tone, children }: StatusMessageProps): React.JSX.Element {
  return (
    <p role={TONE_ROLE[tone]} className={TONE_CLASSES[tone]}>
      {children}
    </p>
  )
}

export default StatusMessage
