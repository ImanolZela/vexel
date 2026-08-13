import { mkdtemp, rm, stat } from 'node:fs/promises'
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

async function createNoisyPng(path: string): Promise<void> {
  // A flat-color swatch compresses identically no matter how hard the
  // encoder tries. Give it real texture so compression effort has
  // something to actually optimize.
  const width = 64
  const height = 64
  const channels = 3
  const data = Buffer.alloc(width * height * channels)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * channels
      data[offset] = (x * 7 + y * 13) % 256
      data[offset + 1] = (x * 3 + y * 29) % 256
      data[offset + 2] = (x * 17 + y * 5) % 256
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(path)
}

async function createFramedPng(path: string): Promise<void> {
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

  await sharp(data, { raw: { width, height, channels } }).png().toFile(path)
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

  it('encodes webp at a higher compression effort than the sharp default', async () => {
    const sourcePath = join(dir, 'noisy.png')
    const destPath = join(dir, 'out.webp')
    await createNoisyPng(sourcePath)

    await convertImage({ sourcePath, destPath, format: 'webp', quality: 80 })
    const tunedSize = (await stat(destPath)).size

    const defaultEffortBuffer = await sharp(sourcePath).webp({ quality: 80, effort: 4 }).toBuffer()

    expect(tunedSize).toBeLessThanOrEqual(defaultEffortBuffer.length)
  })

  it('makes the detected background transparent when removeBackground is set', async () => {
    const sourcePath = join(dir, 'framed.png')
    const destPath = join(dir, 'out.png')
    await createFramedPng(sourcePath)

    await convertImage({ sourcePath, destPath, format: 'png', removeBackground: true })

    const { data, info } = await sharp(destPath).raw().toBuffer({ resolveWithObject: true })
    expect(info.channels).toBe(4)

    const cornerOffset = 0
    expect(data[cornerOffset + 3]).toBe(0)

    const centerOffset = (5 * info.width + 5) * 4
    expect(data[centerOffset + 3]).toBe(255)
  })

  it('ignores removeBackground for jpeg, which has no alpha channel', async () => {
    const sourcePath = join(dir, 'framed.png')
    const destPath = join(dir, 'out.jpeg')
    await createFramedPng(sourcePath)

    await convertImage({ sourcePath, destPath, format: 'jpeg', removeBackground: true })

    const metadata = await sharp(destPath).metadata()
    expect(metadata.format).toBe('jpeg')
    expect(metadata.hasAlpha).toBe(false)
  })
})
