import sharp from 'sharp'
import { detectBackgroundColor, stripBackground } from './background'

sharp.cache(false)

export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'avif' | 'tiff' | 'gif'

export const IMAGE_FORMATS: ImageFormat[] = ['png', 'jpeg', 'webp', 'avif', 'tiff', 'gif']

// jpeg has no alpha channel, so there's nothing background removal could make transparent.
export const FORMATS_SUPPORTING_ALPHA: ImageFormat[] = ['png', 'webp', 'avif', 'tiff', 'gif']

export interface ConvertOptions {
  sourcePath: string
  destPath: string
  format: ImageFormat
  quality?: number
  removeBackground?: boolean
}

async function loadWithBackgroundRemoved(sourcePath: string): Promise<ReturnType<typeof sharp>> {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const background = detectBackgroundColor(data, info.width, info.height, info.channels)
  const rgba = stripBackground(data, info.width, info.height, info.channels, background)

  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
}

export async function convertImage(options: ConvertOptions): Promise<void> {
  const { sourcePath, destPath, format, quality, removeBackground } = options
  const pipeline =
    removeBackground && FORMATS_SUPPORTING_ALPHA.includes(format)
      ? await loadWithBackgroundRemoved(sourcePath)
      : sharp(sourcePath)

  switch (format) {
    case 'png':
      pipeline.png(quality ? { quality } : undefined)
      break
    case 'jpeg':
      pipeline.jpeg(quality ? { quality } : undefined)
      break
    case 'webp':
      pipeline.webp(quality ? { quality } : undefined)
      break
    case 'avif':
      pipeline.avif(quality ? { quality } : undefined)
      break
    case 'tiff':
      pipeline.tiff(quality ? { quality } : undefined)
      break
    case 'gif':
      pipeline.gif()
      break
  }

  await pipeline.toFile(destPath)
}
