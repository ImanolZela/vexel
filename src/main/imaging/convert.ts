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
      // PNG is a lossless format — that's the whole reason to pick it over
      // webp/avif/jpeg. Passing the quality slider's value here (as the
      // code used to) silently turns on palette quantization, throwing
      // colors away without the quality slider looking like it does that
      // for any other format. Keep every pixel exact and instead spend
      // more effort on the (lossless) zlib compression to shrink the file.
      pipeline.png({ compressionLevel: 9, adaptiveFiltering: true })
      break
    case 'jpeg':
      pipeline.jpeg(quality ? { quality } : undefined)
      break
    case 'webp':
      // effort maxes out libwebp's compression search (0-6, sharp defaults
      // to 4). Same quality, consistently smaller files — slower to encode,
      // but a one-off desktop conversion can afford it.
      pipeline.webp({ effort: 6, ...(quality ? { quality } : {}) })
      break
    case 'avif':
      // effort 9 (max) only shaves off another ~1% over 6 for roughly 4x
      // the encode time in testing — past the point of being worth it.
      pipeline.avif({ effort: 6, ...(quality ? { quality } : {}) })
      break
    case 'tiff':
      // sharp defaults tiff to compression: 'jpeg' — meaning the "archival,
      // lossless" format most people pick TIFF for was quietly re-encoding
      // through lossy JPEG. deflate is real lossless compression (same
      // zlib family as PNG) with no such surprise; zstd would compress
      // further but this libvips build isn't compiled with it.
      pipeline.tiff({ compression: 'deflate' })
      break
    case 'gif':
      // gif is inherently palette-limited (256 colors) — that's expected,
      // not a hidden surprise like png/tiff's defaults were. effort just
      // maxes out how hard it searches for the best palette/dithering.
      pipeline.gif({ effort: 10 })
      break
  }

  await pipeline.toFile(destPath)
}
