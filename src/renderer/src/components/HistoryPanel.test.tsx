import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import HistoryPanel from './HistoryPanel'

const ENTRY_A = {
  id: '1',
  kind: 'convert' as const,
  sourceName: 'cat.png',
  destPath: 'C:\\out\\cat_vexel.webp',
  format: 'webp',
  timestamp: Date.now() - 60_000
}

const ENTRY_B = {
  id: '2',
  kind: 'vectorize' as const,
  sourceName: 'dog.jpg',
  destPath: 'C:\\out\\dog.svg',
  timestamp: Date.now() - 120_000
}

describe('HistoryPanel', () => {
  beforeEach(() => {
    vi.mocked(window.api.getHistory).mockReset()
    vi.mocked(window.api.removeHistoryEntry).mockReset()
    vi.mocked(window.api.clearHistory).mockReset()
    vi.mocked(window.api.showInFolder).mockReset()
  })

  it('shows an empty state when there is no history', async () => {
    vi.mocked(window.api.getHistory).mockResolvedValue([])
    render(<HistoryPanel onClose={vi.fn()} />)

    expect(
      await screen.findByText('Todavía no convertiste, vectorizaste ni mejoraste nada.')
    ).toBeInTheDocument()
  })

  it('lists entries with the source name and destination file name', async () => {
    vi.mocked(window.api.getHistory).mockResolvedValue([ENTRY_A, ENTRY_B])
    render(<HistoryPanel onClose={vi.fn()} />)

    expect(await screen.findByText('cat_vexel.webp')).toBeInTheDocument()
    expect(screen.getByText('dog.svg')).toBeInTheDocument()
    expect(screen.getByText(/cat\.png/)).toBeInTheDocument()
  })

  it('opens the containing folder for an entry', async () => {
    vi.mocked(window.api.getHistory).mockResolvedValue([ENTRY_A])
    const user = userEvent.setup()
    render(<HistoryPanel onClose={vi.fn()} />)

    await user.click(await screen.findByRole('button', { name: /Mostrar .* en su carpeta/ }))

    expect(window.api.showInFolder).toHaveBeenCalledWith(ENTRY_A.destPath)
  })

  it('removes a single entry', async () => {
    vi.mocked(window.api.getHistory).mockResolvedValue([ENTRY_A, ENTRY_B])
    vi.mocked(window.api.removeHistoryEntry).mockResolvedValue([ENTRY_B])
    const user = userEvent.setup()
    render(<HistoryPanel onClose={vi.fn()} />)

    await screen.findByText('cat_vexel.webp')
    await user.click(
      screen.getByRole('button', { name: `Quitar ${ENTRY_A.destPath} del historial` })
    )

    expect(window.api.removeHistoryEntry).toHaveBeenCalledWith(ENTRY_A.id)
    expect(screen.queryByText('cat_vexel.webp')).not.toBeInTheDocument()
  })

  it('clears the whole history', async () => {
    vi.mocked(window.api.getHistory).mockResolvedValue([ENTRY_A])
    const user = userEvent.setup()
    render(<HistoryPanel onClose={vi.fn()} />)

    await user.click(await screen.findByRole('button', { name: 'Limpiar historial' }))

    expect(window.api.clearHistory).toHaveBeenCalled()
    expect(
      await screen.findByText('Todavía no convertiste, vectorizaste ni mejoraste nada.')
    ).toBeInTheDocument()
  })
})
