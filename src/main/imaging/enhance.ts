import sharp from 'sharp'

export interface EnhanceOptions {
  autoContrast?: boolean
  denoise?: boolean
  sharpen?: boolean
  scale?: number
}

export async function enhanceImage(
  sourcePath: string,
  destPath: string,
  options: EnhanceOptions
): Promise<void> {
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

  await pipeline.toFile(destPath)
}
