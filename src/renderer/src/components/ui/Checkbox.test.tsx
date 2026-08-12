import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Checkbox from './Checkbox'

describe('Checkbox', () => {
  it('reflects the checked state', () => {
    render(<Checkbox label="Nitidez" checked onChange={vi.fn()} />)

    expect(screen.getByLabelText('Nitidez')).toBeChecked()
  })

  it('calls onChange with the new value when toggled', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Checkbox label="Nitidez" checked={false} onChange={onChange} />)

    await user.click(screen.getByLabelText('Nitidez'))

    expect(onChange).toHaveBeenCalledWith(true)
  })
})
