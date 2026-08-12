import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { enhanceImage } from './enhance'

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'vexel-enhance-'))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

async function createSourceImage(path: string): Promise<void> {
  await sharp({
    create: { width: 40, height: 20, channels: 3, background: { r: 120, g: 130, b: 140 } }
  })
    .png()
    .toFile(path)
}

describe('enhanceImage', () => {
  it('leaves dimensions unchanged when no scale is requested', async () => {
    const sourcePath = join(dir, 'source.png')
    const destPath = join(dir, 'out.png')
    await createSourceImage(sourcePath)

    await enhanceImage(sourcePath, destPath, {})

    const metadata = await sharp(destPath).metadata()
    expect(metadata.width).toBe(40)
    expect(metadata.height).toBe(20)
  })

  it('upscales proportionally when a scale factor is given', async () => {
    const sourcePath = join(dir, 'source.png')
    const destPath = join(dir, 'out.png')
    await createSourceImage(sourcePath)

    await enhanceImage(sourcePath, destPath, { scale: 2 })

    const metadata = await sharp(destPath).metadata()
    expect(metadata.width).toBe(80)
    expect(metadata.height).toBe(40)
  })

  it('applies sharpen, denoise and auto-contrast together without failing', async () => {
    const sourcePath = join(dir, 'source.png')
    const destPath = join(dir, 'out.png')
    await createSourceImage(sourcePath)

    await enhanceImage(sourcePath, destPath, {
      autoContrast: true,
      denoise: true,
      sharpen: true,
      scale: 1.5
    })

    const metadata = await sharp(destPath).metadata()
    expect(metadata.width).toBe(60)
  })

  it('stretches a narrow contrast range towards full black and white', async () => {
    const width = 10
    const height = 10
    const channels = 3
    const raw = Buffer.alloc(width * height * channels)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * channels
        const value = x < width / 2 ? 100 : 150
        raw[offset] = value
        raw[offset + 1] = value
        raw[offset + 2] = value
      }
    }

    const sourcePath = join(dir, 'gradient.png')
    const destPath = join(dir, 'out.png')
    await sharp(raw, { raw: { width, height, channels } }).png().toFile(sourcePath)

    await enhanceImage(sourcePath, destPath, { autoContrast: true })

    const { data } = await sharp(destPath).raw().toBuffer({ resolveWithObject: true })
    expect(data[0]).toBeLessThan(30)
    expect(data[(width - 1) * channels]).toBeGreaterThan(225)
  })
})
