import { describe, expect, it } from 'vitest'
import { suggestedSvgFileName } from './svgFileName'

describe('suggestedSvgFileName', () => {
  it('replaces the extension with svg', () => {
    expect(suggestedSvgFileName('cat.png')).toBe('cat.svg')
  })

  it('handles file names without an extension', () => {
    expect(suggestedSvgFileName('cat')).toBe('cat.svg')
  })

  it('handles file names with multiple dots', () => {
    expect(suggestedSvgFileName('cat.v2.final.png')).toBe('cat.v2.final.svg')
  })
})
