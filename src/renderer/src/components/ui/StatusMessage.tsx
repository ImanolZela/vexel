import type { ReactNode } from 'react'

type StatusTone = 'success' | 'error' | 'info'

interface StatusMessageProps {
  tone: StatusTone
  children: ReactNode
}

// text-convert/text-vectorize are ~2:1 against the background — well under
// WCAG AA's 4.5:1 for text. The *-text tokens are the same hue lightened
// until they clear it; the base tones stay reserved for borders/backgrounds.
const TONE_CLASSES: Record<StatusTone, string> = {
  success: 'text-convert-text',
  error: 'text-vectorize-text',
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
