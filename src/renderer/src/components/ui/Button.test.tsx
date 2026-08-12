import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('renders its children and responds to clicks', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={onClick}>Convertir</Button>)

    await user.click(screen.getByRole('button', { name: 'Convertir' }))

    expect(onClick).toHaveBeenCalled()
  })

  it('marks itself active via data-active for the pill variant', () => {
    render(
      <Button variant="pill" active>
        Nítido
      </Button>
    )

    expect(screen.getByRole('button', { name: 'Nítido' })).toHaveAttribute('data-active', 'true')
  })

  it('respects the disabled prop', () => {
    render(<Button disabled>Convertir</Button>)

    expect(screen.getByRole('button', { name: 'Convertir' })).toBeDisabled()
  })
})
