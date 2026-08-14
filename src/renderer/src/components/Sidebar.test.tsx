import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Sidebar from './Sidebar'

function renderSidebar(overrides: Partial<React.ComponentProps<typeof Sidebar>> = {}) {
  return render(
    <Sidebar
      active="convert"
      onSelect={vi.fn()}
      onOpenHistory={vi.fn()}
      onOpenSettings={vi.fn()}
      {...overrides}
    />
  )
}

describe('Sidebar', () => {
  it('renders the three modes', () => {
    renderSidebar()

    expect(screen.getByRole('button', { name: 'Convertir' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Vectorizar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mejorar' })).toBeInTheDocument()
  })

  it('marks the active mode', () => {
    renderSidebar({ active: 'vectorize' })

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
    renderSidebar({ onSelect })

    await user.click(screen.getByRole('button', { name: 'Mejorar' }))

    expect(onSelect).toHaveBeenCalledWith('enhance')
  })

  it('opens the history panel', async () => {
    const user = userEvent.setup()
    const onOpenHistory = vi.fn()
    renderSidebar({ onOpenHistory })

    await user.click(screen.getByRole('button', { name: 'Historial' }))

    expect(onOpenHistory).toHaveBeenCalled()
  })

  it('opens the settings panel', async () => {
    const user = userEvent.setup()
    const onOpenSettings = vi.fn()
    renderSidebar({ onOpenSettings })

    await user.click(screen.getByRole('button', { name: 'Configuración' }))

    expect(onOpenSettings).toHaveBeenCalled()
  })
})
