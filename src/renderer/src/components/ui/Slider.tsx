interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  formatValue?: (value: number) => string
  onChange: (value: number) => void
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  formatValue,
  onChange
}: SliderProps): React.JSX.Element {
  const displayValue = formatValue ? formatValue(value) : String(value)
  // Paints the filled portion of the track up to the current value, so the
  // slider reads at a glance instead of needing to read the number next to
  // it — the native track is flat gray regardless of value (see index.css).
  const percent = ((value - min) / (max - min)) * 100

  return (
    <label className="flex flex-col gap-1 text-sm text-text-secondary">
      {label} ({displayValue})
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{
          background: `linear-gradient(to right, var(--mode-accent) ${percent}%, var(--color-surface) ${percent}%)`
        }}
      />
    </label>
  )
}

export default Slider
