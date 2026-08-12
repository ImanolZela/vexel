import { describe, expect, it } from 'vitest'
import { traceMaskToPathTag } from './trace'

describe('traceMaskToPathTag', () => {
  it('traces a solid region into an svg path tag', async () => {
    const width = 20
    const height = 20
    const mask = new Uint8Array(width * height)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width / 2; x++) {
        mask[y * width + x] = 1
      }
    }

    const pathTag = await traceMaskToPathTag(mask, width, height, '#ff0000')

    expect(pathTag.startsWith('<path')).toBe(true)
    expect(pathTag).toContain('fill="#ff0000"')
    expect(pathTag).toMatch(/d="[^"]+"/)
  })

  it('produces an empty path when the mask has no foreground pixels', async () => {
    const width = 10
    const height = 10
    const mask = new Uint8Array(width * height)

    const pathTag = await traceMaskToPathTag(mask, width, height, '#000000')

    expect(pathTag).toContain('d=""')
  })
})
