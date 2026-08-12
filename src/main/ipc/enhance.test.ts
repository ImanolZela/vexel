import { beforeEach, describe, expect, it, vi } from 'vitest'
import { registerEnhanceHandlers } from './enhance'
import { enhanceImage, enhanceImagePreview } from '../imaging/enhance'

type Handler = (...args: unknown[]) => unknown

const handlers = new Map<string, Handler>()

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, listener: Handler) => handlers.set(channel, listener)
  }
}))

vi.mock('../imaging/enhance', () => ({
  enhanceImage: vi.fn(),
  enhanceImagePreview: vi.fn()
}))

describe('registerEnhanceHandlers', () => {
  beforeEach(() => {
    handlers.clear()
    vi.clearAllMocks()
    registerEnhanceHandlers()
  })

  it('returns ok when enhancing to a file succeeds', async () => {
    vi.mocked(enhanceImage).mockResolvedValue(undefined)

    const result = await handlers.get('image:enhance')?.(
      {},
      { sourcePath: 'a.png', destPath: 'b.png', sharpen: true }
    )

    expect(result).toEqual({ ok: true })
    expect(enhanceImage).toHaveBeenCalledWith('a.png', 'b.png', { sharpen: true })
  })

  it('returns the error message when enhancing to a file fails', async () => {
    vi.mocked(enhanceImage).mockRejectedValue(new Error('boom'))

    const result = await handlers.get('image:enhance')?.(
      {},
      { sourcePath: 'a.png', destPath: 'b.png' }
    )

    expect(result).toEqual({ ok: false, error: 'boom' })
  })

  it('returns the preview thumbnail on success', async () => {
    vi.mocked(enhanceImagePreview).mockResolvedValue('data:image/webp;base64,abc')

    const result = await handlers.get('image:enhance-preview')?.(
      {},
      { sourcePath: 'a.png', scale: 2 }
    )

    expect(result).toEqual({ ok: true, thumbnail: 'data:image/webp;base64,abc' })
    expect(enhanceImagePreview).toHaveBeenCalledWith('a.png', { scale: 2 })
  })

  it('returns the error message when the preview fails', async () => {
    vi.mocked(enhanceImagePreview).mockRejectedValue(new Error('boom'))

    const result = await handlers.get('image:enhance-preview')?.({}, { sourcePath: 'a.png' })

    expect(result).toEqual({ ok: false, error: 'boom' })
  })
})
