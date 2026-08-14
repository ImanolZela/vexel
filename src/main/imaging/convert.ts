import sharp from 'sharp'
import { detectBackgroundColor, stripBackground } from './background'
import { applyFormatEncoding, FORMATS_SUPPORTING_ALPHA, type ImageFormat } from './encode'

sharp.cache(false)

export type { ImageFormat }
export { IMAGE_FORMATS, FORMATS_SUPPORTING_ALPHA } from './encode'

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

  applyFormatEncoding(pipeline, format, quality)

  await pipeline.toFile(destPath)
}
