import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SettingsPanel from './SettingsPanel'

describe('SettingsPanel', () => {
  beforeEach(() => {
    vi.mocked(window.api.getSettings).mockReset()
    vi.mocked(window.api.updateSettings).mockReset()
    vi.mocked(window.api.chooseDirectory).mockReset()
  })

  it('shows "Preguntar cada vez" when no default directory is set', async () => {
    vi.mocked(window.api.getSettings).mockResolvedValue({ defaultDownloadDir: null })
    render(<SettingsPanel onClose={vi.fn()} />)

    expect(await screen.findByText('Preguntar cada vez')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Elegir carpeta…' })).toBeInTheDocument()
  })

  it('shows the configured directory and lets it be changed', async () => {
    vi.mocked(window.api.getSettings).mockResolvedValue({
      defaultDownloadDir: 'C:\\Users\\me\\Downloads'
    })
    vi.mocked(window.api.chooseDirectory).mockResolvedValue('C:\\Users\\me\\Pictures')
    vi.mocked(window.api.updateSettings).mockResolvedValue({
      defaultDownloadDir: 'C:\\Users\\me\\Pictures'
    })
    const user = userEvent.setup()
    render(<SettingsPanel onClose={vi.fn()} />)

    expect(await screen.findByText('C:\\Users\\me\\Downloads')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cambiar carpeta…' }))

    expect(window.api.updateSettings).toHaveBeenCalledWith({
      defaultDownloadDir: 'C:\\Users\\me\\Pictures'
    })
    expect(await screen.findByText('C:\\Users\\me\\Pictures')).toBeInTheDocument()
  })

  it('does not update settings when the directory dialog is canceled', async () => {
    vi.mocked(window.api.getSettings).mockResolvedValue({ defaultDownloadDir: null })
    vi.mocked(window.api.chooseDirectory).mockResolvedValue(null)
    const user = userEvent.setup()
    render(<SettingsPanel onClose={vi.fn()} />)

    await user.click(await screen.findByRole('button', { name: 'Elegir carpeta…' }))

    expect(window.api.updateSettings).not.toHaveBeenCalled()
  })

  it('clears the configured directory', async () => {
    vi.mocked(window.api.getSettings).mockResolvedValue({
      defaultDownloadDir: 'C:\\Users\\me\\Downloads'
    })
    vi.mocked(window.api.updateSettings).mockResolvedValue({ defaultDownloadDir: null })
    const user = userEvent.setup()
    render(<SettingsPanel onClose={vi.fn()} />)

    await user.click(await screen.findByRole('button', { name: 'Quitar' }))

    expect(window.api.updateSettings).toHaveBeenCalledWith({ defaultDownloadDir: null })
    expect(await screen.findByText('Preguntar cada vez')).toBeInTheDocument()
  })
})
