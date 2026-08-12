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
})
