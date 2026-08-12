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

    const result = await quantizeImage(sourcePath, { colors: 2 })

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
})
