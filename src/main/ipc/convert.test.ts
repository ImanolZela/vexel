import { beforeEach, describe, expect, it, vi } from 'vitest'
import { registerConvertHandlers } from './convert'
import { convertImage } from '../imaging/convert'

type Handler = (...args: unknown[]) => unknown

const handlers = new Map<string, Handler>()

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, listener: Handler) => handlers.set(channel, listener)
  }
}))

vi.mock('../imaging/convert', () => ({
  convertImage: vi.fn()
}))

describe('registerConvertHandlers', () => {
  beforeEach(() => {
    handlers.clear()
    vi.clearAllMocks()
    registerConvertHandlers()
  })

  it('returns ok when the conversion succeeds', async () => {
    vi.mocked(convertImage).mockResolvedValue(undefined)

    const result = await handlers.get('image:convert')?.(
      {},
      {
        sourcePath: 'a.png',
        destPath: 'a.webp',
        format: 'webp'
      }
    )

    expect(result).toEqual({ ok: true })
  })

  it('returns the error message when the conversion fails', async () => {
    vi.mocked(convertImage).mockRejectedValue(new Error('boom'))

    const result = await handlers.get('image:convert')?.(
      {},
      {
        sourcePath: 'a.png',
        destPath: 'a.webp',
        format: 'webp'
      }
    )

    expect(result).toEqual({ ok: false, error: 'boom' })
  })
})
