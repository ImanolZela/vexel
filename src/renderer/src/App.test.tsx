import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  it('shows Convertir by default', () => {
    render(<App />)
    expect(screen.getByTestId('screen-convert')).toBeInTheDocument()
  })

  it('switches to Vectorizar when its nav item is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Vectorizar' }))

    expect(screen.getByTestId('screen-vectorize')).toBeInTheDocument()
    expect(screen.queryByTestId('screen-convert')).not.toBeInTheDocument()
  })

  it('switches to Mejorar when its nav item is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Mejorar' }))

    expect(screen.getByTestId('screen-enhance')).toBeInTheDocument()
  })

  it('animates the screen area on every mode change', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByTestId('screen-convert').parentElement).toHaveClass(
      'animate-[screen-fade-in_180ms_ease-out]'
    )

    await user.click(screen.getByRole('button', { name: 'Vectorizar' }))

    expect(screen.getByTestId('screen-vectorize').parentElement).toHaveClass(
      'animate-[screen-fade-in_180ms_ease-out]'
    )
  })

  describe('global drag and drop', () => {
    beforeEach(() => {
      vi.mocked(window.api.getPathForFile).mockReset()
    })

    it('shows an overlay while dragging anywhere over the window', () => {
      render(<App />)
      const shell = document.getElementById('app-shell') as HTMLElement

      fireEvent.dragEnter(shell)

      expect(screen.getByText('Soltá para agregar imágenes')).toBeInTheDocument()
    })

    it('keeps the overlay up while the drag crosses internal elements', () => {
      // dragenter/dragleave fire — and bubble — on every element boundary
      // the pointer crosses, not just the whole shell's. A naive
      // "hide on any dragleave" would flicker the overlay off here even
      // though the drag never actually left the window.
      render(<App />)
      const shell = document.getElementById('app-shell') as HTMLElement
      const sidebarButton = screen.getByRole('button', { name: 'Vectorizar' })

      fireEvent.dragEnter(shell)
      fireEvent.dragEnter(sidebarButton)
      fireEvent.dragLeave(sidebarButton)

      expect(screen.getByText('Soltá para agregar imágenes')).toBeInTheDocument()
    })

    it('hides the overlay once the drag actually leaves the shell', () => {
      render(<App />)
      const shell = document.getElementById('app-shell') as HTMLElement

      fireEvent.dragEnter(shell)
      fireEvent.dragLeave(shell)

      expect(screen.queryByText('Soltá para agregar imágenes')).not.toBeInTheDocument()
    })

    it('adds a file dropped anywhere over the window, not just the dropzone box', () => {
      vi.mocked(window.api.getPathForFile).mockReturnValue('C:\\images\\dog.png')
      render(<App />)
      const shell = document.getElementById('app-shell') as HTMLElement
      const file = new File(['content'], 'dog.png', { type: 'image/png' })

      fireEvent.drop(shell, { dataTransfer: { files: [file] } })

      expect(screen.getAllByText('dog.png').length).toBeGreaterThan(0)
      expect(screen.queryByText('Soltá para agregar imágenes')).not.toBeInTheDocument()
    })
  })
})
