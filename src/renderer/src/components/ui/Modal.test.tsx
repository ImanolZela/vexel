import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Modal from './Modal'

describe('Modal', () => {
  it('renders its title and children', () => {
    render(
      <Modal title="Historial" onClose={vi.fn()}>
        <p>contenido</p>
      </Modal>
    )

    expect(screen.getByRole('dialog', { name: 'Historial' })).toBeInTheDocument()
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <Modal title="Historial" onClose={onClose}>
        <p>contenido</p>
      </Modal>
    )

    await user.click(screen.getByRole('button', { name: 'Cerrar' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when the backdrop is clicked, but not when the dialog itself is', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <Modal title="Historial" onClose={onClose}>
        <p>contenido</p>
      </Modal>
    )

    await user.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()

    await user.click(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose on Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal title="Historial" onClose={onClose}>
        <p>contenido</p>
      </Modal>
    )

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).toHaveBeenCalled()
  })
})
