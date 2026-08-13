interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

function Checkbox({ label, checked, onChange, disabled }: CheckboxProps): React.JSX.Element {
  return (
    <label
      className={`flex items-center gap-2 text-sm ${disabled ? 'text-text-secondary/50' : 'text-text-secondary'}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}

export default Checkbox
