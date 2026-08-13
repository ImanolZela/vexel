import { describe, expect, it } from 'vitest'
import {
  colorDistance,
  detectBackgroundColor,
  floodFillBackgroundMask,
  stripBackground
} from './background'

const WIDTH = 12
const HEIGHT = 12
const CHANNELS = 3
const BG = { r: 255, g: 255, b: 255 }
const FG = { r: 30, g: 120, b: 200 }

function createFramedImage(): Uint8Array {
  const data = new Uint8Array(WIDTH * HEIGHT * CHANNELS)
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const offset = (y * WIDTH + x) * CHANNELS
      // Center square stays clear of the 4px corner sample squares on a 12x12 canvas.
      const isCenter = x >= 4 && x < 8 && y >= 4 && y < 8
      const color = isCenter ? FG : BG
      data[offset] = color.r
      data[offset + 1] = color.g
      data[offset + 2] = color.b
    }
  }
  return data
}

describe('colorDistance', () => {
  it('is zero for identical colors and grows with difference', () => {
    expect(colorDistance(BG, BG)).toBe(0)
    expect(colorDistance(BG, FG)).toBeGreaterThan(0)
  })
})

describe('detectBackgroundColor', () => {
  it('reads the color that touches all four corners', () => {
    const data = createFramedImage()
    const detected = detectBackgroundColor(data, WIDTH, HEIGHT, CHANNELS)

    expect(detected).toEqual(BG)
  })
})

describe('floodFillBackgroundMask', () => {
  it('does not mark a background-colored island that is not connected to the edge', () => {
    // 16x16: white background, a blue ring from [3,12), and a white island
    // fully enclosed by the ring at [6,9) — same color as the background,
    // but unreachable from the border without crossing the ring.
    const size = 16
    const data = new Uint8Array(size * size * CHANNELS)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const offset = (y * size + x) * CHANNELS
        const inRing = x >= 3 && x < 12 && y >= 3 && y < 12
        const inIsland = x >= 6 && x < 9 && y >= 6 && y < 9
        const color = inRing && !inIsland ? FG : BG
        data[offset] = color.r
        data[offset + 1] = color.g
        data[offset + 2] = color.b
      }
    }

    const mask = floodFillBackgroundMask(data, size, size, CHANNELS, BG)

    expect(mask[0]).toBe(1) // corner: real background

    const islandOffset = 7 * size + 7 // inside the enclosed island
    expect(mask[islandOffset]).toBe(0)

    const ringOffset = 5 * size + 5 // inside the ring itself
    expect(mask[ringOffset]).toBe(0)
  })
})

describe('stripBackground', () => {
  it('makes background pixels transparent and keeps the foreground opaque', () => {
    const data = createFramedImage()
    const rgba = stripBackground(data, WIDTH, HEIGHT, CHANNELS, BG)

    expect(rgba.length).toBe(WIDTH * HEIGHT * 4)

    const cornerOffset = 0
    expect(rgba[cornerOffset + 3]).toBe(0)

    const centerOffset = (5 * WIDTH + 5) * 4
    expect(rgba[centerOffset]).toBe(FG.r)
    expect(rgba[centerOffset + 1]).toBe(FG.g)
    expect(rgba[centerOffset + 2]).toBe(FG.b)
    expect(rgba[centerOffset + 3]).toBe(255)
  })

  it('preserves an already-transparent source pixel', () => {
    const data = new Uint8Array([FG.r, FG.g, FG.b, 128])
    const rgba = stripBackground(data, 1, 1, 4, BG)

    expect(rgba[3]).toBe(128)
  })
})
