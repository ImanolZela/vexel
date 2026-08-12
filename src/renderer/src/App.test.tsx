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

      fireEvent.dragOver(shell)

      expect(screen.getByText('Soltá para agregar imágenes')).toBeInTheDocument()
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
