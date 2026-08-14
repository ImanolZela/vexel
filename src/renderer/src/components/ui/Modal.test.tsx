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

  it('moves focus into the dialog on open and restores it on close', () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'Abrir'
    document.body.appendChild(trigger)
    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    const { unmount } = render(
      <Modal title="Historial" onClose={vi.fn()}>
        <p>contenido</p>
      </Modal>
    )

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cerrar' }))

    unmount()
    expect(document.activeElement).toBe(trigger)

    trigger.remove()
  })

  it('cycles Tab focus between the first and last focusable elements', async () => {
    const user = userEvent.setup()
    render(
      <Modal title="Historial" onClose={vi.fn()}>
        <button type="button">Acción</button>
      </Modal>
    )

    const closeButton = screen.getByRole('button', { name: 'Cerrar' })
    const actionButton = screen.getByRole('button', { name: 'Acción' })
    expect(document.activeElement).toBe(closeButton)

    await user.tab()
    expect(document.activeElement).toBe(actionButton)

    await user.tab()
    expect(document.activeElement).toBe(closeButton)

    await user.tab({ shift: true })
    expect(document.activeElement).toBe(actionButton)
  })
})
