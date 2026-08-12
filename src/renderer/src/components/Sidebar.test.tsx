import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  it('renders the three modes', () => {
    render(<Sidebar active="convert" onSelect={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Convertir' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Vectorizar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mejorar' })).toBeInTheDocument()
  })

  it('marks the active mode', () => {
    render(<Sidebar active="vectorize" onSelect={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Vectorizar' })).toHaveAttribute(
      'data-active',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Convertir' })).toHaveAttribute(
      'data-active',
      'false'
    )
  })

  it('calls onSelect with the clicked mode', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Sidebar active="convert" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'Mejorar' }))

    expect(onSelect).toHaveBeenCalledWith('enhance')
  })
})
