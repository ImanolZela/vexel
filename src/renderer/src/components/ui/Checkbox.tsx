import { useId } from 'react'
import HintIcon from './HintIcon'

interface CheckboxProps {
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

function Checkbox({ label, hint, checked, onChange, disabled }: CheckboxProps): React.JSX.Element {
  const hintId = useId()

  return (
    <div className="flex flex-col gap-0.5">
      <label
        className={`flex items-center gap-2 text-sm ${disabled ? 'text-text-secondary/50' : 'text-text-secondary'}`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-describedby={hint ? hintId : undefined}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="inline-flex items-center gap-1.5">
          {label}
          {hint && <HintIcon text={hint} />}
        </span>
      </label>
      {/* Outside the <label> on purpose — see HintIcon. */}
      {hint && (
        <span id={hintId} className="sr-only">
          {hint}
        </span>
      )}
    </div>
  )
}

export default Checkbox
