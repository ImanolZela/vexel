import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { convertImage, type ImageFormat } from './convert'

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'vexel-convert-'))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

async function createSourcePng(path: string): Promise<void> {
  await sharp({
    create: { width: 8, height: 8, channels: 3, background: { r: 200, g: 50, b: 10 } }
  })
    .png()
    .toFile(path)
}

describe('convertImage', () => {
  const cases: Array<[ImageFormat, string]> = [
    ['png', 'png'],
    ['jpeg', 'jpeg'],
    ['webp', 'webp'],
    ['tiff', 'tiff'],
    ['gif', 'gif']
  ]

  it.each(cases)('converts a png source to %s', async (format, expectedFormat) => {
    const sourcePath = join(dir, 'source.png')
    const destPath = join(dir, `out.${format}`)
    await createSourcePng(sourcePath)

    await convertImage({ sourcePath, destPath, format })

    const metadata = await sharp(destPath).metadata()
    expect(metadata.format).toBe(expectedFormat)
  })

  it('converts to avif', async () => {
    const sourcePath = join(dir, 'source.png')
    const destPath = join(dir, 'out.avif')
    await createSourcePng(sourcePath)

    await convertImage({ sourcePath, destPath, format: 'avif' })

    const metadata = await sharp(destPath).metadata()
    expect(['avif', 'heif']).toContain(metadata.format)
  })

  it('respects the quality option', async () => {
    const sourcePath = join(dir, 'source.png')
    const lowQualityPath = join(dir, 'low.jpeg')
    const highQualityPath = join(dir, 'high.jpeg')
    await createSourcePng(sourcePath)

    await convertImage({ sourcePath, destPath: lowQualityPath, format: 'jpeg', quality: 10 })
    await convertImage({ sourcePath, destPath: highQualityPath, format: 'jpeg', quality: 95 })

    const [low, high] = await Promise.all([
      sharp(lowQualityPath).metadata(),
      sharp(highQualityPath).metadata()
    ])

    expect(low.size ?? 0).toBeLessThan(high.size ?? Infinity)
  })
})
