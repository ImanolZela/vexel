import { useId } from 'react'
import HintIcon from './HintIcon'

interface SliderProps {
  label: string
  /** Short explanation shown on hover for values whose meaning isn't
   *  obvious from the label alone (e.g. "Suavizado"). Optional — most
   *  sliders (Calidad, Escala) are self-explanatory and skip it. */
  hint?: string
  value: number
  min: number
  max: number
  step?: number
  formatValue?: (value: number) => string
  onChange: (value: number) => void
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  formatValue,
  onChange
}: SliderProps): React.JSX.Element {
  const hintId = useId()
  const displayValue = formatValue ? formatValue(value) : String(value)
  // Paints the filled portion of the track up to the current value, so the
  // slider reads at a glance instead of needing to read the number next to
  // it — the native track is flat gray regardless of value (see index.css).
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-1 text-sm text-text-secondary">
      <label className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1.5">
          {label} ({displayValue}){hint && <HintIcon text={hint} />}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-describedby={hint ? hintId : undefined}
          onChange={(event) => onChange(Number(event.target.value))}
          style={{
            background: `linear-gradient(to right, var(--mode-accent) ${percent}%, var(--color-surface) ${percent}%)`
          }}
        />
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

export default Slider
