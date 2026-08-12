import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Dropzone from './Dropzone'
import { FilesProvider } from '../state/FilesContext'

function renderDropzone(): ReturnType<typeof render> {
  return render(
    <FilesProvider>
      <Dropzone />
    </FilesProvider>
  )
}

describe('Dropzone', () => {
  beforeEach(() => {
    vi.mocked(window.api.openFiles).mockReset()
    vi.mocked(window.api.getPathForFile).mockReset()
  })

  it('adds files picked through the browse button', async () => {
    vi.mocked(window.api.openFiles).mockResolvedValue(['C:\\images\\cat.png'])
    const user = userEvent.setup()
    renderDropzone()

    await user.click(screen.getByRole('button', { name: 'Seleccionar archivos' }))

    expect(await screen.findByText('cat.png')).toBeInTheDocument()
  })

  it('adds files dropped onto the zone', () => {
    vi.mocked(window.api.getPathForFile).mockReturnValue('C:\\images\\dog.png')
    renderDropzone()

    const zone = screen.getByText('Arrastrá imágenes acá').parentElement as HTMLElement
    const file = new File(['content'], 'dog.png', { type: 'image/png' })

    fireEvent.drop(zone, { dataTransfer: { files: [file] } })

    expect(screen.getByText('dog.png')).toBeInTheDocument()
  })

  it('removes a file when its remove button is clicked', async () => {
    vi.mocked(window.api.openFiles).mockResolvedValue(['C:\\images\\cat.png'])
    const user = userEvent.setup()
    renderDropzone()

    await user.click(screen.getByRole('button', { name: 'Seleccionar archivos' }))
    await screen.findByText('cat.png')
    await user.click(screen.getByRole('button', { name: 'Quitar cat.png' }))

    expect(screen.queryByText('cat.png')).not.toBeInTheDocument()
  })
})
