import sharp from 'sharp'

sharp.cache(false)

export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'avif' | 'tiff' | 'gif'

export const IMAGE_FORMATS: ImageFormat[] = ['png', 'jpeg', 'webp', 'avif', 'tiff', 'gif']

export interface ConvertOptions {
  sourcePath: string
  destPath: string
  format: ImageFormat
  quality?: number
}

export async function convertImage(options: ConvertOptions): Promise<void> {
  const { sourcePath, destPath, format, quality } = options
  const pipeline = sharp(sourcePath)

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
