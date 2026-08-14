import { describe, expect, it } from 'vitest'
import { formatFromExtension } from './encode'

describe('formatFromExtension', () => {
  it.each([
    ['photo.png', 'png'],
    ['photo.PNG', 'png'],
    ['photo.jpg', 'jpeg'],
    ['photo.jpeg', 'jpeg'],
    ['photo.webp', 'webp'],
    ['photo.avif', 'avif'],
    ['photo.tiff', 'tiff'],
    ['photo.tif', 'tiff'],
    ['photo.gif', 'gif'],
    ['C:\\Users\\me\\photo-mejorado.webp', 'webp']
  ])('maps %s to %s', (path, expected) => {
    expect(formatFromExtension(path)).toBe(expected)
  })

  it('returns null for an unrecognized or missing extension', () => {
    expect(formatFromExtension('photo.bmp')).toBeNull()
    expect(formatFromExtension('photo')).toBeNull()
  })
})
