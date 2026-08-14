import { InfoIcon } from '../icons'

interface HintIconProps {
  text: string
}

// Shared hover tooltip for control labels whose meaning isn't obvious from
// the name alone (e.g. Vectorizar's "Suavizado"). Just the native `title`
// on hover — the caller is responsible for also wiring the same text as a
// visually-hidden `aria-describedby` target *outside* any <label> it owns,
// so keyboard/screen-reader users get the explanation without it leaking
// into the label's accessible name (which would break exact-text queries
// like `getByLabelText('Quitar fondo')`).
function HintIcon({ text }: HintIconProps): React.JSX.Element {
  return (
    <span
      title={text}
      tabIndex={-1}
      className="inline-flex items-center align-middle text-text-secondary/60 hover:text-[var(--mode-accent)]"
    >
      <InfoIcon className="h-3.5 w-3.5" />
    </span>
  )
}

export default HintIcon
