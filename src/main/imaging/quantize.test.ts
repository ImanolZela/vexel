import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { quantizeImage } from './quantize'

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'vexel-quantize-'))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

async function createTwoColorImage(path: string): Promise<void> {
  const width = 4
  const height = 4
  const channels = 3
  const data = Buffer.alloc(width * height * channels)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * channels
      const isTop = y < height / 2
      data[offset] = isTop ? 220 : 20
      data[offset + 1] = 20
      data[offset + 2] = isTop ? 20 : 220
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(path)
}

describe('quantizeImage', () => {
  it('splits a two-region image into a two-color palette with disjoint masks', async () => {
    const sourcePath = join(dir, 'two-colors.png')
    await createTwoColorImage(sourcePath)

    // blurSigma disabled: this fixture is tiny enough that the default
    // pre-blur (meant for photo-sized edges) would smear it end to end.
    const result = await quantizeImage(sourcePath, { colors: 2, blurSigma: 0 })

    expect(result.width).toBe(4)
    expect(result.height).toBe(4)
    expect(result.palette).toHaveLength(2)
    expect(result.masks).toHaveLength(2)

    const [red, blue] = result.palette
    expect(red.r).toBeGreaterThan(150)
    expect(red.b).toBeLessThan(80)
    expect(blue.b).toBeGreaterThan(150)
    expect(blue.r).toBeLessThan(80)

    const pixelCount = result.width * result.height
    expect(result.masks[0].reduce((sum, value) => sum + value, 0)).toBe(pixelCount / 2)
    expect(result.masks[1].reduce((sum, value) => sum + value, 0)).toBe(pixelCount / 2)

    for (let i = 0; i < pixelCount; i++) {
      const coverage = result.masks[0][i] + result.masks[1][i]
      expect(coverage).toBe(1)
    }
  })

  it('caps the palette at the requested color count', async () => {
    const sourcePath = join(dir, 'two-colors.png')
    await createTwoColorImage(sourcePath)

    const result = await quantizeImage(sourcePath, { colors: 8 })

    expect(result.palette.length).toBeLessThanOrEqual(8)
  })

  it('reserves a palette slot for a distinct color even when it is outnumbered by near-duplicate shades of another color', async () => {
    // 30x30: three close blue shades (12 apart, well inside the merge
    // tolerance) split across most of the canvas — like JPEG noise across
    // one big region — plus a small, clearly different red patch. Naively
    // taking the top-2 most frequent raw buckets would pick two of the blue
    // shades and drop red entirely; merging near-duplicates first should
    // free up a slot for it despite its much lower pixel count.
    const sourcePath = join(dir, 'noisy-region.png')
    const width = 30
    const height = 30
    const channels = 3
    const data = Buffer.alloc(width * height * channels)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * channels
        const isRedPatch = y < 5 && x < 5
        let color: [number, number, number]
        if (isRedPatch) {
          color = [200, 20, 20]
        } else if (y < 12) {
          color = [10, 10, 180]
        } else if (y < 21) {
          color = [10, 10, 168]
        } else {
          color = [10, 10, 156]
        }
        data[offset] = color[0]
        data[offset + 1] = color[1]
        data[offset + 2] = color[2]
      }
    }
    await sharp(data, { raw: { width, height, channels } }).png().toFile(sourcePath)

    const result = await quantizeImage(sourcePath, { colors: 2 })

    expect(result.palette).toHaveLength(2)
    const hasRed = result.palette.some((color) => color.r > 150 && color.g < 100 && color.b < 100)
    const hasBlue = result.palette.some((color) => color.b > 100 && color.r < 100)
    expect(hasRed).toBe(true)
    expect(hasBlue).toBe(true)
  })

  it('smooths a noisy anti-aliased edge instead of tracing it as a speckled line', async () => {
    // 60x10: solid color A on the left, solid color B on the right, with a
    // 10px transition band between them that linearly blends A->B but has
    // a checkerboard jitter added on top — standing in for the noisy
    // anti-aliasing band a real JPEG edge produces. Without smoothing, that
    // jitter flips nearest-color assignment pixel by pixel near the
    // midpoint instead of cleanly splitting at it.
    const width = 60
    const height = 10
    const channels = 3
    const bandStart = 25
    const bandWidth = 10
    const jitter = 25

    function buildImage(): Buffer {
      const data = Buffer.alloc(width * height * channels)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const offset = (y * width + x) * channels
          let value: number
          if (x < bandStart) {
            value = 0 // pure A: (0, 0, 200)
          } else if (x >= bandStart + bandWidth) {
            value = 200 // pure B: (200, 0, 0)
          } else {
            const t = (x - bandStart) / bandWidth
            const base = t * 200
            const sign = (x + y) % 2 === 0 ? 1 : -1
            value = Math.min(200, Math.max(0, base + sign * jitter))
          }
          data[offset] = value
          data[offset + 1] = 0
          data[offset + 2] = 200 - value
        }
      }
      return data
    }

    async function countBandMismatches(blurSigma: number): Promise<number> {
      const sourcePath = join(dir, `edge-${blurSigma}.png`)
      await sharp(buildImage(), { raw: { width, height, channels } }).png().toFile(sourcePath)

      const result = await quantizeImage(sourcePath, { colors: 2, blurSigma })
      const blueIndex = result.palette.findIndex((color) => color.b > color.r)
      const blueMask = result.masks[blueIndex]

      let mismatches = 0
      for (let y = 0; y < height; y++) {
        for (let x = bandStart; x < bandStart + bandWidth; x++) {
          const truthIsBlue = x < bandStart + bandWidth / 2
          const isBlue = blueMask[y * width + x] === 1
          if (isBlue !== truthIsBlue) mismatches++
        }
      }
      return mismatches
    }

    const unblurred = await countBandMismatches(0)
    const blurred = await countBandMismatches(0.6)

    expect(unblurred).toBeGreaterThan(0)
    expect(blurred).toBeLessThan(unblurred)
  })

  it('drops the background palette entry once its region is cleared', async () => {
    const sourcePath = join(dir, 'framed.png')
    const width = 12
    const height = 12
    const channels = 3
    const data = Buffer.alloc(width * height * channels)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * channels
        // Center square stays clear of the 4px corner sample squares.
        const isCenter = x >= 4 && x < 8 && y >= 4 && y < 8
        data[offset] = isCenter ? 30 : 255
        data[offset + 1] = isCenter ? 120 : 255
        data[offset + 2] = isCenter ? 200 : 255
      }
    }
    await sharp(data, { raw: { width, height, channels } }).png().toFile(sourcePath)

    // blurSigma disabled: this fixture is tiny enough that the default
    // pre-blur (meant for photo-sized edges) would smear it end to end.
    const withBackground = await quantizeImage(sourcePath, { colors: 2, blurSigma: 0 })
    expect(withBackground.palette).toHaveLength(2)

    const withoutBackground = await quantizeImage(sourcePath, {
      colors: 2,
      detectBackground: true,
      blurSigma: 0
    })
    expect(withoutBackground.palette).toHaveLength(1)
    expect(withoutBackground.palette[0].r).toBeLessThan(80)
  })

  it('keeps a background-colored detail that is not connected to the edge', async () => {
    // 16x16: white background, a blue ring from [3,12), and a white island
    // enclosed by the ring at [6,9) — same color as the background but
    // unreachable from the border, like a dress pattern or a tooth.
    const sourcePath = join(dir, 'island.png')
    const size = 16
    const channels = 3
    const data = Buffer.alloc(size * size * channels)

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const offset = (y * size + x) * channels
        const inRing = x >= 3 && x < 12 && y >= 3 && y < 12
        const inIsland = x >= 6 && x < 9 && y >= 6 && y < 9
        const isBackground = !inRing || inIsland
        data[offset] = isBackground ? 255 : 30
        data[offset + 1] = isBackground ? 255 : 120
        data[offset + 2] = isBackground ? 255 : 200
      }
    }
    await sharp(data, { raw: { width: size, height: size, channels } })
      .png()
      .toFile(sourcePath)

    const result = await quantizeImage(sourcePath, { colors: 2, detectBackground: true })

    expect(result.palette).toHaveLength(2)
    const whiteIndex = result.palette.findIndex((color) => color.r > 200)
    const whiteMask = result.masks[whiteIndex]

    const islandOffset = 7 * size + 7
    expect(whiteMask[islandOffset]).toBe(1)

    const cornerOffset = 0
    expect(whiteMask[cornerOffset]).toBe(0)
  })
})
