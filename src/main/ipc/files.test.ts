import { beforeEach, describe, expect, it, vi } from 'vitest'
import { dialog } from 'electron'
import type { BrowserWindow } from 'electron'
import { registerFileHandlers } from './files'

type Handler = (...args: unknown[]) => unknown

const handlers = new Map<string, Handler>()

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, listener: Handler) => handlers.set(channel, listener)
  },
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn()
  }
}))

const fakeWindow = {} as BrowserWindow

describe('registerFileHandlers', () => {
  beforeEach(() => {
    handlers.clear()
    vi.clearAllMocks()
    registerFileHandlers(() => fakeWindow)
  })

  it('returns the selected paths from the open dialog', async () => {
    vi.mocked(dialog.showOpenDialog).mockResolvedValue({
      canceled: false,
      filePaths: ['a.png', 'b.png']
    })

    const result = await handlers.get('dialog:open-files')?.()

    expect(result).toEqual(['a.png', 'b.png'])
  })

  it('returns an empty list when the open dialog is canceled', async () => {
    vi.mocked(dialog.showOpenDialog).mockResolvedValue({ canceled: true, filePaths: [] })

    const result = await handlers.get('dialog:open-files')?.()

    expect(result).toEqual([])
  })

  it('returns an empty list when there is no window', async () => {
    handlers.clear()
    registerFileHandlers(() => null)

    const result = await handlers.get('dialog:open-files')?.()

    expect(result).toEqual([])
  })

  it('returns the chosen path from the save dialog', async () => {
    vi.mocked(dialog.showSaveDialog).mockResolvedValue({
      canceled: false,
      filePath: 'out.png'
    })

    const result = await handlers.get('dialog:save-file')?.({}, 'out.png')

    expect(result).toBe('out.png')
  })

  it('returns null when the save dialog is canceled', async () => {
    vi.mocked(dialog.showSaveDialog).mockResolvedValue({ canceled: true, filePath: '' })

    const result = await handlers.get('dialog:save-file')?.({}, 'out.png')

    expect(result).toBeNull()
  })
})
