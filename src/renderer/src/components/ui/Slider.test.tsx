import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Slider from './Slider'

describe('Slider', () => {
  it('shows the label with the current value', () => {
    render(<Slider label="Colores" value={6} min={2} max={16} onChange={vi.fn()} />)

    expect(screen.getByText('Colores (6)')).toBeInTheDocument()
  })

  it('formats the value with formatValue when given', () => {
    render(
      <Slider
        label="Simplificar curvas"
        value={0.2}
        min={0.1}
        max={2}
        step={0.1}
        formatValue={(value) => value.toFixed(1)}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText('Simplificar curvas (0.2)')).toBeInTheDocument()
  })

  it('calls onChange with a number when moved', () => {
    const onChange = vi.fn()
    render(<Slider label="Colores" value={6} min={2} max={16} onChange={onChange} />)

    const input = screen.getByRole('slider')
    fireChange(input, '10')

    expect(onChange).toHaveBeenCalledWith(10)
  })
})

function fireChange(element: Element, value: string): void {
  const input = element as HTMLInputElement
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('change', { bubbles: true }))
}
