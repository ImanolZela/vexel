import sharp from 'sharp'
import { createThumbnail } from './thumbnail'

export interface EnhanceOptions {
  autoContrast?: boolean
  denoise?: boolean
  sharpen?: boolean
  scale?: number
}

async function buildPipeline(
  sourcePath: string,
  options: EnhanceOptions
): Promise<ReturnType<typeof sharp>> {
  let pipeline = sharp(sourcePath)

  if (options.autoContrast) {
    pipeline = pipeline.normalise()
  }

  if (options.denoise) {
    pipeline = pipeline.median(3)
  }

  if (options.scale && options.scale !== 1) {
    const metadata = await sharp(sourcePath).metadata()
    if (metadata.width) {
      pipeline = pipeline.resize({
        width: Math.round(metadata.width * options.scale),
        kernel: 'lanczos3'
      })
    }
  }

  if (options.sharpen) {
    pipeline = pipeline.sharpen()
  }

  return pipeline
}

export async function enhanceImage(
  sourcePath: string,
  destPath: string,
  options: EnhanceOptions
): Promise<void> {
  const pipeline = await buildPipeline(sourcePath, options)
  await pipeline.toFile(destPath)
}

export async function enhanceImagePreview(
  sourcePath: string,
  options: EnhanceOptions,
  maxSize = 240
): Promise<string> {
  const pipeline = await buildPipeline(sourcePath, options)
  const buffer = await pipeline.toBuffer()
  return createThumbnail(buffer, maxSize)
}
