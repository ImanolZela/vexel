import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { vectorizeImage, rgbToHex } from './vectorize'

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'vexel-vectorize-'))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

async function createTwoColorImage(path: string): Promise<void> {
  const width = 20
  const height = 20
  const channels = 3
  const data = Buffer.alloc(width * height * channels)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * channels
      const isLeft = x < width / 2
      data[offset] = isLeft ? 220 : 20
      data[offset + 1] = 20
      data[offset + 2] = isLeft ? 20 : 220
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(path)
}

async function createFramedImage(path: string): Promise<void> {
  const width = 20
  const height = 20
  const channels = 3
  const data = Buffer.alloc(width * height * channels)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * channels
      const isCenter = x >= 6 && x < 14 && y >= 6 && y < 14
      data[offset] = isCenter ? 30 : 255
      data[offset + 1] = isCenter ? 120 : 255
      data[offset + 2] = isCenter ? 200 : 255
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(path)
}

describe('vectorizeImage', () => {
  it('produces an svg with one real path per palette color', async () => {
    const sourcePath = join(dir, 'source.png')
    await createTwoColorImage(sourcePath)

    const svg = await vectorizeImage(sourcePath, { colors: 2 })

    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('viewBox="0 0 20 20"')
    expect((svg.match(/<path/g) ?? []).length).toBe(2)
    expect(svg).toContain(`fill="${rgbToHex({ r: 220, g: 20, b: 20 })}"`)
    expect(svg).toContain(`fill="${rgbToHex({ r: 20, g: 20, b: 220 })}"`)
  })

  it('keeps the background path when removeBackground is not set', async () => {
    const sourcePath = join(dir, 'framed.png')
    await createFramedImage(sourcePath)

    const svg = await vectorizeImage(sourcePath, { colors: 2 })

    expect(svg).toContain(`fill="${rgbToHex({ r: 255, g: 255, b: 255 })}"`)
    expect((svg.match(/<path/g) ?? []).length).toBe(2)
  })

  it('drops the background path when removeBackground is set', async () => {
    const sourcePath = join(dir, 'framed.png')
    await createFramedImage(sourcePath)

    const svg = await vectorizeImage(sourcePath, { colors: 2, removeBackground: true })

    expect(svg).not.toContain(`fill="${rgbToHex({ r: 255, g: 255, b: 255 })}"`)
    expect(svg).toContain(`fill="${rgbToHex({ r: 30, g: 120, b: 200 })}"`)
    expect((svg.match(/<path/g) ?? []).length).toBe(1)
  })
})
