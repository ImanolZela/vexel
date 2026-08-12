import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { createThumbnail } from './thumbnail'

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'vexel-thumbnail-'))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

describe('createThumbnail', () => {
  it('returns a webp data url no larger than the requested size', async () => {
    const sourcePath = join(dir, 'source.png')
    await sharp({
      create: { width: 400, height: 200, channels: 3, background: { r: 10, g: 20, b: 30 } }
    })
      .png()
      .toFile(sourcePath)

    const dataUrl = await createThumbnail(sourcePath, 96)

    expect(dataUrl.startsWith('data:image/webp;base64,')).toBe(true)

    const base64 = dataUrl.replace('data:image/webp;base64,', '')
    const metadata = await sharp(Buffer.from(base64, 'base64')).metadata()
    expect(metadata.width).toBeLessThanOrEqual(96)
    expect(metadata.height).toBeLessThanOrEqual(96)
  })
})
