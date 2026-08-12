import { act, render, screen } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { useEffect } from 'react'
import VectorizeScreen from './VectorizeScreen'
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
      colors: 6,
      turdSize: 2,
      optTolerance: 0.2
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
      optTolerance: 0.2
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
})

function fireChange(element: Element, value: string): void {
  const input = element as HTMLInputElement
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('change', { bubbles: true }))
}
