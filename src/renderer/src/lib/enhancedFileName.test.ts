import { describe, expect, it } from 'vitest'
import { suggestedEnhancedFileName } from './enhancedFileName'

describe('suggestedEnhancedFileName', () => {
  it('inserts a suffix before the extension', () => {
    expect(suggestedEnhancedFileName('cat.png')).toBe('cat-mejorado.png')
  })

  it('handles file names without an extension', () => {
    expect(suggestedEnhancedFileName('cat')).toBe('cat-mejorado')
  })

  it('handles file names with multiple dots', () => {
    expect(suggestedEnhancedFileName('cat.v2.final.png')).toBe('cat.v2.final-mejorado.png')
  })
})
