interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function Checkbox({ label, checked, onChange }: CheckboxProps): React.JSX.Element {
  return (
    <label className="flex items-center gap-2 text-sm text-text-secondary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}

export default Checkbox
