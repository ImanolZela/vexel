import { render, screen } from '@testing-library/react'
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
  })

  it('adds files picked through the browse button', async () => {
    vi.mocked(window.api.openFiles).mockResolvedValue(['C:\\images\\cat.png'])
    const user = userEvent.setup()
    renderDropzone()

    await user.click(screen.getByRole('button', { name: 'Seleccionar archivos' }))

    expect(await screen.findByText('cat.png')).toBeInTheDocument()
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

  it('gives the remove button a tooltip', async () => {
    vi.mocked(window.api.openFiles).mockResolvedValue(['C:\\images\\cat.png'])
    const user = userEvent.setup()
    renderDropzone()

    await user.click(screen.getByRole('button', { name: 'Seleccionar archivos' }))
    await screen.findByText('cat.png')

    expect(screen.getByRole('button', { name: 'Quitar cat.png' })).toHaveAttribute(
      'title',
      'Quitar cat.png'
    )
  })
})
