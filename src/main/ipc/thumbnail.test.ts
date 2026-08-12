import { beforeEach, describe, expect, it, vi } from 'vitest'
import { registerThumbnailHandlers } from './thumbnail'
import { createThumbnail } from '../imaging/thumbnail'

type Handler = (...args: unknown[]) => unknown

const handlers = new Map<string, Handler>()

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, listener: Handler) => handlers.set(channel, listener)
  }
}))

vi.mock('../imaging/thumbnail', () => ({
  createThumbnail: vi.fn()
}))

describe('registerThumbnailHandlers', () => {
  beforeEach(() => {
    handlers.clear()
    vi.clearAllMocks()
    registerThumbnailHandlers()
  })

  it('returns the generated data url', async () => {
    vi.mocked(createThumbnail).mockResolvedValue('data:image/webp;base64,abc')

    const result = await handlers.get('image:thumbnail')?.({}, 'cat.png')

    expect(result).toBe('data:image/webp;base64,abc')
  })

  it('returns null when the thumbnail cannot be generated', async () => {
    vi.mocked(createThumbnail).mockRejectedValue(new Error('bad file'))

    const result = await handlers.get('image:thumbnail')?.({}, 'broken.png')

    expect(result).toBeNull()
  })
})
