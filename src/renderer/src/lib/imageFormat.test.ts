import { describe, expect, it } from 'vitest'
import { suggestedFileName } from './imageFormat'

describe('suggestedFileName', () => {
  it('replaces the extension with the target format', () => {
    expect(suggestedFileName('cat.png', 'webp')).toBe('cat.webp')
  })

  it('maps jpeg to the jpg extension', () => {
    expect(suggestedFileName('cat.png', 'jpeg')).toBe('cat.jpg')
  })

  it('handles file names without an extension', () => {
    expect(suggestedFileName('cat', 'gif')).toBe('cat.gif')
  })

  it('handles file names with multiple dots', () => {
    expect(suggestedFileName('cat.v2.final.png', 'avif')).toBe('cat.v2.final.avif')
  })
})
