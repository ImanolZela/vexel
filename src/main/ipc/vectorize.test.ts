import { beforeEach, describe, expect, it, vi } from 'vitest'
import { registerVectorizeHandlers } from './vectorize'
import { vectorizeImage } from '../imaging/vectorize'

type Handler = (...args: unknown[]) => unknown

const handlers = new Map<string, Handler>()

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, listener: Handler) => handlers.set(channel, listener)
  }
}))

vi.mock('../imaging/vectorize', () => ({
  vectorizeImage: vi.fn()
}))

describe('registerVectorizeHandlers', () => {
  beforeEach(() => {
    handlers.clear()
    vi.clearAllMocks()
    registerVectorizeHandlers()
  })

  it('returns the generated svg on success', async () => {
    vi.mocked(vectorizeImage).mockResolvedValue('<svg></svg>')

    const result = await handlers.get('image:vectorize')?.({}, { sourcePath: 'a.png', colors: 4 })

    expect(result).toEqual({ ok: true, svg: '<svg></svg>' })
    expect(vectorizeImage).toHaveBeenCalledWith('a.png', { colors: 4 })
  })

  it('returns the error message when vectorizing fails', async () => {
    vi.mocked(vectorizeImage).mockRejectedValue(new Error('boom'))

    const result = await handlers.get('image:vectorize')?.({}, { sourcePath: 'a.png', colors: 4 })

    expect(result).toEqual({ ok: false, error: 'boom' })
  })
})
