import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useEffect } from 'react'
import ConvertScreen from './ConvertScreen'
import { FilesProvider } from '../state/FilesContext'
import { useFiles } from '../hooks/useFiles'

function SeedFile({ path, name }: { path: string; name: string }): null {
  const { addFiles } = useFiles()
  useEffect(() => {
    addFiles([{ path, name }])
  }, [addFiles, path, name])
  return null
}

function renderWithFile(path = 'C:\\images\\cat.png', name = 'cat.png'): ReturnType<typeof render> {
  return render(
    <FilesProvider>
      <SeedFile path={path} name={name} />
      <ConvertScreen />
    </FilesProvider>
  )
}

describe('ConvertScreen', () => {
  beforeEach(() => {
    vi.mocked(window.api.saveFile).mockReset()
    vi.mocked(window.api.convertImage).mockReset()
  })

  it('shows a hint when no file is selected', () => {
    render(
      <FilesProvider>
        <ConvertScreen />
      </FilesProvider>
    )

    expect(screen.getByText('Seleccioná un archivo arriba para convertirlo.')).toBeInTheDocument()
  })

  it('converts the selected file with the chosen format and quality', async () => {
    vi.mocked(window.api.saveFile).mockResolvedValue('C:\\images\\cat.webp')
    vi.mocked(window.api.convertImage).mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    renderWithFile()

    await user.selectOptions(screen.getByRole('combobox'), 'webp')
    await user.click(screen.getByRole('button', { name: 'Convertir' }))

    expect(window.api.saveFile).toHaveBeenCalledWith('cat.webp')
    expect(window.api.convertImage).toHaveBeenCalledWith({
      sourcePath: 'C:\\images\\cat.png',
      destPath: 'C:\\images\\cat.webp',
      format: 'webp',
      quality: 80
    })
    expect(await screen.findByText('Guardado en C:\\images\\cat.webp')).toBeInTheDocument()
  })

  it('shows an error message when the conversion fails', async () => {
    vi.mocked(window.api.saveFile).mockResolvedValue('C:\\images\\cat.webp')
    vi.mocked(window.api.convertImage).mockResolvedValue({ ok: false, error: 'boom' })
    const user = userEvent.setup()
    renderWithFile()

    await user.click(screen.getByRole('button', { name: 'Convertir' }))

    expect(await screen.findByText('boom')).toBeInTheDocument()
  })

  it('does not convert when the save dialog is canceled', async () => {
    vi.mocked(window.api.saveFile).mockResolvedValue(null)
    const user = userEvent.setup()
    renderWithFile()

    await user.click(screen.getByRole('button', { name: 'Convertir' }))

    expect(window.api.convertImage).not.toHaveBeenCalled()
  })
})
