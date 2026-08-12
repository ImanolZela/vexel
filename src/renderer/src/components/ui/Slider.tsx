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
      />
    </label>
  )
}

export default Slider
