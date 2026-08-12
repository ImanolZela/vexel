import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useEffect } from 'react'
import EnhanceScreen from './EnhanceScreen'
import { FilesProvider } from '../state/FilesContext'
import { useFiles } from '../hooks/useFiles'

const CAT = { path: 'C:\\images\\cat.png', name: 'cat.png' }

function SeedFile(): null {
  const { addFiles } = useFiles()
  useEffect(() => {
    addFiles([CAT])
  }, [addFiles])
  return null
}

function renderWithFile(): ReturnType<typeof render> {
  return render(
    <FilesProvider>
      <SeedFile />
      <EnhanceScreen />
    </FilesProvider>
  )
}

async function resolvePreview(): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(400)
  })
}

describe('EnhanceScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(window.api.enhancePreview).mockReset()
    vi.mocked(window.api.enhanceImage).mockReset()
    vi.mocked(window.api.saveFile).mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a hint when no file is selected', () => {
    render(
      <FilesProvider>
        <EnhanceScreen />
      </FilesProvider>
    )

    expect(screen.getByText('Seleccioná un archivo arriba para mejorarlo.')).toBeInTheDocument()
  })

  it('requests a preview with the default options after the debounce', async () => {
    vi.mocked(window.api.enhancePreview).mockResolvedValue({
      ok: true,
      thumbnail: 'data:image/webp;base64,abc'
    })
    renderWithFile()

    await resolvePreview()

    expect(window.api.enhancePreview).toHaveBeenCalledWith({
      sourcePath: CAT.path,
      autoContrast: false,
      denoise: false,
      sharpen: false,
      scale: 1
    })
    expect(screen.getByAltText('cat.png mejorado')).toHaveAttribute(
      'src',
      'data:image/webp;base64,abc'
    )
  })

  it('re-requests the preview when a toggle changes', async () => {
    vi.mocked(window.api.enhancePreview).mockResolvedValue({ ok: true, thumbnail: 'x' })
    renderWithFile()
    await resolvePreview()

    await act(async () => {
      screen.getByLabelText('Nitidez').click()
    })
    await resolvePreview()

    expect(window.api.enhancePreview).toHaveBeenLastCalledWith({
      sourcePath: CAT.path,
      autoContrast: false,
      denoise: false,
      sharpen: true,
      scale: 1
    })
  })

  it('applies a preset and requests a preview with its options', async () => {
    vi.mocked(window.api.enhancePreview).mockResolvedValue({ ok: true, thumbnail: 'x' })
    renderWithFile()
    await resolvePreview()

    await act(async () => {
      screen.getByRole('button', { name: 'Upscale rápido' }).click()
    })
    await resolvePreview()

    expect(window.api.enhancePreview).toHaveBeenLastCalledWith({
      sourcePath: CAT.path,
      autoContrast: false,
      denoise: false,
      sharpen: true,
      scale: 2
    })
    expect(screen.getByRole('button', { name: 'Upscale rápido' })).toHaveAttribute(
      'data-active',
      'true'
    )
  })

  it('shows an error message when the preview fails', async () => {
    vi.mocked(window.api.enhancePreview).mockResolvedValue({ ok: false, error: 'boom' })
    renderWithFile()

    await resolvePreview()

    expect(screen.getByText('boom')).toBeInTheDocument()
  })

  it('saves the enhanced image to the chosen path', async () => {
    vi.mocked(window.api.enhancePreview).mockResolvedValue({ ok: true, thumbnail: 'x' })
    vi.mocked(window.api.saveFile).mockResolvedValue('C:\\images\\cat-mejorado.png')
    vi.mocked(window.api.enhanceImage).mockResolvedValue({ ok: true })
    renderWithFile()
    await resolvePreview()

    await act(async () => {
      screen.getByRole('button', { name: 'Guardar' }).click()
    })

    expect(window.api.saveFile).toHaveBeenCalledWith('cat-mejorado.png')
    expect(window.api.enhanceImage).toHaveBeenCalledWith({
      sourcePath: CAT.path,
      destPath: 'C:\\images\\cat-mejorado.png',
      autoContrast: false,
      denoise: false,
      sharpen: false,
      scale: 1
    })
    expect(screen.getByText('Guardado en C:\\images\\cat-mejorado.png')).toBeInTheDocument()
  })

  it('does not save when the save dialog is canceled', async () => {
    vi.mocked(window.api.enhancePreview).mockResolvedValue({ ok: true, thumbnail: 'x' })
    vi.mocked(window.api.saveFile).mockResolvedValue(null)
    renderWithFile()
    await resolvePreview()

    await act(async () => {
      screen.getByRole('button', { name: 'Guardar' }).click()
    })

    expect(window.api.enhanceImage).not.toHaveBeenCalled()
  })
})
