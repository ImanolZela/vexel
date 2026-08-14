import { act, render, screen } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { useEffect } from 'react'
import VectorizeScreen from './VectorizeScreen'
import { FilesProvider } from '../state/FilesContext'
import { useFiles } from '../hooks/useFiles'

const CAT = { path: 'C:\\images\\cat.png', name: 'cat.png' }
const DOG = { path: 'C:\\images\\dog.png', name: 'dog.png' }

function SeedFile(): null {
  const { addFiles } = useFiles()
  useEffect(() => {
    addFiles([CAT])
  }, [addFiles])
  return null
}

function SeedTwoFiles(): null {
  const { addFiles } = useFiles()
  useEffect(() => {
    addFiles([CAT, DOG])
  }, [addFiles])
  return null
}

function renderWithFile(): ReturnType<typeof render> {
  return render(
    <FilesProvider>
      <SeedFile />
      <VectorizeScreen />
    </FilesProvider>
  )
}

async function resolveVectorize(): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(400)
  })
}

describe('VectorizeScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(window.api.vectorizeImage).mockReset()
    vi.mocked(window.api.saveFile).mockReset()
    vi.mocked(window.api.writeTextFile).mockReset()
    vi.mocked(window.api.getSettings).mockResolvedValue({ defaultDownloadDir: null })
    vi.mocked(window.api.addHistoryEntry).mockReset().mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a hint when no file is selected', () => {
    render(
      <FilesProvider>
        <VectorizeScreen />
      </FilesProvider>
    )

    expect(screen.getByText('Seleccioná un archivo arriba para vectorizarlo.')).toBeInTheDocument()
  })

  it('vectorizes the selected file after the debounce and shows the preview', async () => {
    vi.mocked(window.api.vectorizeImage).mockResolvedValue({
      ok: true,
      svg: '<svg data-testid="stub"></svg>'
    })
    renderWithFile()

    await resolveVectorize()

    expect(window.api.vectorizeImage).toHaveBeenCalledWith({
      sourcePath: CAT.path,
      colors: 12,
      turdSize: 2,
      optTolerance: 0.2,
      removeBackground: false
    })
    expect(
      screen.getByTestId('vectorize-preview').querySelector('[data-testid="stub"]')
    ).not.toBeNull()
  })

  it('re-vectorizes with new parameters when a control changes', async () => {
    vi.mocked(window.api.vectorizeImage).mockResolvedValue({ ok: true, svg: '<svg></svg>' })
    renderWithFile()
    await resolveVectorize()

    const [colorsSlider] = screen.getAllByRole('slider')
    act(() => {
      fireChange(colorsSlider, '10')
    })
    await resolveVectorize()

    expect(window.api.vectorizeImage).toHaveBeenLastCalledWith({
      sourcePath: CAT.path,
      colors: 10,
      turdSize: 2,
      optTolerance: 0.2,
      removeBackground: false
    })
  })

  it('re-vectorizes with removeBackground when the checkbox is toggled', async () => {
    vi.mocked(window.api.vectorizeImage).mockResolvedValue({ ok: true, svg: '<svg></svg>' })
    renderWithFile()
    await resolveVectorize()

    act(() => {
      screen.getByLabelText('Quitar fondo').click()
    })
    await resolveVectorize()

    expect(window.api.vectorizeImage).toHaveBeenLastCalledWith({
      sourcePath: CAT.path,
      colors: 12,
      turdSize: 2,
      optTolerance: 0.2,
      removeBackground: true
    })
  })

  it('shows an error message when vectorizing fails', async () => {
    vi.mocked(window.api.vectorizeImage).mockResolvedValue({ ok: false, error: 'boom' })
    renderWithFile()

    await resolveVectorize()

    expect(screen.getByText('boom')).toBeInTheDocument()
  })

  it('shows the resulting file size once vectorized', async () => {
    vi.mocked(window.api.vectorizeImage).mockResolvedValue({ ok: true, svg: '<svg></svg>' })
    renderWithFile()

    await resolveVectorize()

    expect(screen.getByText(/Tamaño:/)).toBeInTheDocument()
  })

  it('exports the svg to the chosen path', async () => {
    vi.mocked(window.api.vectorizeImage).mockResolvedValue({ ok: true, svg: '<svg></svg>' })
    vi.mocked(window.api.saveFile).mockResolvedValue('C:\\images\\cat.svg')
    vi.mocked(window.api.writeTextFile).mockResolvedValue({ ok: true })
    renderWithFile()
    await resolveVectorize()

    await act(async () => {
      screen.getByRole('button', { name: 'Exportar SVG' }).click()
    })

    expect(window.api.saveFile).toHaveBeenCalledWith('cat.svg')
    expect(window.api.writeTextFile).toHaveBeenCalledWith('C:\\images\\cat.svg', '<svg></svg>')
    expect(screen.getByText('Guardado en C:\\images\\cat.svg')).toBeInTheDocument()
  })

  it('does not export when the save dialog is canceled', async () => {
    vi.mocked(window.api.vectorizeImage).mockResolvedValue({ ok: true, svg: '<svg></svg>' })
    vi.mocked(window.api.saveFile).mockResolvedValue(null)
    renderWithFile()
    await resolveVectorize()

    await act(async () => {
      screen.getByRole('button', { name: 'Exportar SVG' }).click()
    })

    expect(window.api.writeTextFile).not.toHaveBeenCalled()
  })

  it('logs a history entry once the export succeeds', async () => {
    vi.mocked(window.api.vectorizeImage).mockResolvedValue({ ok: true, svg: '<svg></svg>' })
    vi.mocked(window.api.saveFile).mockResolvedValue('C:\\images\\cat.svg')
    vi.mocked(window.api.writeTextFile).mockResolvedValue({ ok: true })
    renderWithFile()
    await resolveVectorize()

    await act(async () => {
      screen.getByRole('button', { name: 'Exportar SVG' }).click()
    })

    expect(window.api.addHistoryEntry).toHaveBeenCalledWith({
      kind: 'vectorize',
      sourceName: 'cat.png',
      destPath: 'C:\\images\\cat.svg',
      format: 'svg'
    })
  })

  it('does not log history when the export fails', async () => {
    vi.mocked(window.api.vectorizeImage).mockResolvedValue({ ok: true, svg: '<svg></svg>' })
    vi.mocked(window.api.saveFile).mockResolvedValue('C:\\images\\cat.svg')
    vi.mocked(window.api.writeTextFile).mockResolvedValue({ ok: false, error: 'boom' })
    renderWithFile()
    await resolveVectorize()

    await act(async () => {
      screen.getByRole('button', { name: 'Exportar SVG' }).click()
    })

    expect(window.api.addHistoryEntry).not.toHaveBeenCalled()
  })

  it('shows a file picker with multiple files and switches the active one', async () => {
    vi.mocked(window.api.vectorizeImage).mockResolvedValue({ ok: true, svg: '<svg></svg>' })
    render(
      <FilesProvider>
        <SeedTwoFiles />
        <VectorizeScreen />
      </FilesProvider>
    )
    await resolveVectorize()

    expect(window.api.vectorizeImage).toHaveBeenLastCalledWith(
      expect.objectContaining({ sourcePath: CAT.path })
    )

    await act(async () => {
      screen.getByRole('button', { name: DOG.name }).click()
    })
    await resolveVectorize()

    expect(window.api.vectorizeImage).toHaveBeenLastCalledWith(
      expect.objectContaining({ sourcePath: DOG.path })
    )
  })

  it('opens the save dialog inside the configured default download folder', async () => {
    vi.mocked(window.api.vectorizeImage).mockResolvedValue({ ok: true, svg: '<svg></svg>' })
    vi.mocked(window.api.getSettings).mockResolvedValue({ defaultDownloadDir: 'C:\\default' })
    vi.mocked(window.api.saveFile).mockResolvedValue(null)
    renderWithFile()
    await resolveVectorize()

    await act(async () => {
      screen.getByRole('button', { name: 'Exportar SVG' }).click()
    })

    expect(window.api.saveFile).toHaveBeenCalledWith('C:\\default/cat.svg')
  })
})

function fireChange(element: Element, value: string): void {
  const input = element as HTMLInputElement
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('change', { bubbles: true }))
}
