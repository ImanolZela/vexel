import { describe, expect, it } from 'vitest'
import { ENHANCE_PRESETS } from './enhancePresets'

describe('ENHANCE_PRESETS', () => {
  it('exposes the three documented presets', () => {
    expect(ENHANCE_PRESETS.map((preset) => preset.label)).toEqual([
      'Nítido',
      'Suave',
      'Upscale rápido'
    ])
  })

  it('gives each preset a unique id', () => {
    const ids = ENHANCE_PRESETS.map((preset) => preset.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
