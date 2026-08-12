import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

  it('returns the chosen directory', async () => {
    vi.mocked(dialog.showOpenDialog).mockResolvedValue({
      canceled: false,
      filePaths: ['C:\\images']
    })

    const result = await handlers.get('dialog:choose-directory')?.()

    expect(result).toBe('C:\\images')
  })

  it('returns null when the directory dialog is canceled', async () => {
    vi.mocked(dialog.showOpenDialog).mockResolvedValue({ canceled: true, filePaths: [] })

    const result = await handlers.get('dialog:choose-directory')?.()

    expect(result).toBeNull()
  })

  describe('file:write-text', () => {
    let dir: string

    beforeEach(async () => {
      dir = await mkdtemp(join(tmpdir(), 'vexel-write-text-'))
    })

    afterEach(async () => {
      await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
    })

    it('writes the given content to the given path', async () => {
      const path = join(dir, 'out.svg')

      const result = await handlers.get('file:write-text')?.({}, path, '<svg></svg>')

      expect(result).toEqual({ ok: true })
      expect(await readFile(path, 'utf8')).toBe('<svg></svg>')
    })

    it('returns an error when the path is not writable', async () => {
      const path = join(dir, 'missing-folder', 'out.svg')

      const result = await handlers.get('file:write-text')?.({}, path, '<svg></svg>')

      expect(result).toMatchObject({ ok: false })
    })
  })
})
