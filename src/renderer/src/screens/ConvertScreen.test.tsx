import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useEffect } from 'react'
import ConvertScreen from './ConvertScreen'
import { FilesProvider } from '../state/FilesContext'
import { useFiles } from '../hooks/useFiles'
import type { SelectedFile } from '../types/file'

function SeedFiles({ files }: { files: SelectedFile[] }): null {
  const { addFiles } = useFiles()
  useEffect(() => {
    addFiles(files)
  }, [addFiles, files])
  return null
}

function renderWithFiles(files: SelectedFile[]): ReturnType<typeof render> {
  return render(
    <FilesProvider>
      <SeedFiles files={files} />
      <ConvertScreen />
    </FilesProvider>
  )
}

const CAT = { path: 'C:\\images\\cat.png', name: 'cat.png' }
const DOG = { path: 'C:\\images\\dog.png', name: 'dog.png' }

describe('ConvertScreen', () => {
  beforeEach(() => {
    vi.mocked(window.api.chooseDirectory).mockReset()
    vi.mocked(window.api.convertImage).mockReset()
    vi.mocked(window.api.joinPath).mockImplementation((...segments) => segments.join('\\'))
  })

  it('shows a hint when no file is selected', () => {
    render(
      <FilesProvider>
        <ConvertScreen />
      </FilesProvider>
    )

    expect(
      screen.getByText('Seleccioná uno o más archivos arriba para convertirlos.')
    ).toBeInTheDocument()
  })

  it('converts every selected file into the chosen directory', async () => {
    vi.mocked(window.api.chooseDirectory).mockResolvedValue('C:\\out')
    vi.mocked(window.api.convertImage).mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    renderWithFiles([CAT, DOG])

    await user.selectOptions(screen.getByRole('combobox'), 'webp')
    await user.click(screen.getByRole('button', { name: 'Convertir todo (2)' }))

    expect(window.api.convertImage).toHaveBeenCalledWith({
      sourcePath: CAT.path,
      destPath: 'C:\\out\\cat_vexel.webp',
      format: 'webp',
      quality: 80,
      removeBackground: false
    })
    expect(window.api.convertImage).toHaveBeenCalledWith({
      sourcePath: DOG.path,
      destPath: 'C:\\out\\dog_vexel.webp',
      format: 'webp',
      quality: 80,
      removeBackground: false
    })

    const catRow = screen.getByText('cat.png').closest('li') as HTMLElement
    const dogRow = screen.getByText('dog.png').closest('li') as HTMLElement
    expect(await within(catRow).findByText('Listo')).toBeInTheDocument()
    expect(await within(dogRow).findByText('Listo')).toBeInTheDocument()
  })

  it('reports a per-file error without stopping the batch', async () => {
    vi.mocked(window.api.chooseDirectory).mockResolvedValue('C:\\out')
    vi.mocked(window.api.convertImage).mockImplementation(async (options) => {
      return options.sourcePath === CAT.path ? { ok: false, error: 'boom' } : { ok: true }
    })
    const user = userEvent.setup()
    renderWithFiles([CAT, DOG])

    await user.click(screen.getByRole('button', { name: 'Convertir todo (2)' }))

    const catRow = screen.getByText('cat.png').closest('li') as HTMLElement
    const dogRow = screen.getByText('dog.png').closest('li') as HTMLElement
    expect(await within(catRow).findByText('boom')).toBeInTheDocument()
    expect(await within(dogRow).findByText('Listo')).toBeInTheDocument()
  })

  it('sends removeBackground when the checkbox is checked for an alpha-capable format', async () => {
    vi.mocked(window.api.chooseDirectory).mockResolvedValue('C:\\out')
    vi.mocked(window.api.convertImage).mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    renderWithFiles([CAT])

    await user.click(screen.getByLabelText('Quitar fondo'))
    await user.click(screen.getByRole('button', { name: 'Convertir todo (1)' }))

    expect(window.api.convertImage).toHaveBeenCalledWith({
      sourcePath: CAT.path,
      destPath: 'C:\\out\\cat_vexel.png',
      format: 'png',
      quality: 80,
      removeBackground: true
    })
  })

  it('disables and ignores removeBackground for jpeg, which has no alpha channel', async () => {
    vi.mocked(window.api.chooseDirectory).mockResolvedValue('C:\\out')
    vi.mocked(window.api.convertImage).mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    renderWithFiles([CAT])

    await user.selectOptions(screen.getByRole('combobox'), 'jpeg')

    expect(screen.getByLabelText(/Quitar fondo/)).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Convertir todo (1)' }))

    expect(window.api.convertImage).toHaveBeenCalledWith({
      sourcePath: CAT.path,
      destPath: 'C:\\out\\cat_vexel.jpg',
      format: 'jpeg',
      quality: 80,
      removeBackground: false
    })
  })

  it('does not convert when the directory dialog is canceled', async () => {
    vi.mocked(window.api.chooseDirectory).mockResolvedValue(null)
    const user = userEvent.setup()
    renderWithFiles([CAT])

    await user.click(screen.getByRole('button', { name: 'Convertir todo (1)' }))

    expect(window.api.convertImage).not.toHaveBeenCalled()
  })
})
