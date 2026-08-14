import sharp from 'sharp'

export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'avif' | 'tiff' | 'gif'

export const IMAGE_FORMATS: ImageFormat[] = ['png', 'jpeg', 'webp', 'avif', 'tiff', 'gif']

// jpeg has no alpha channel, so there's nothing background removal could make transparent.
export const FORMATS_SUPPORTING_ALPHA: ImageFormat[] = ['png', 'webp', 'avif', 'tiff', 'gif']

const EXTENSION_TO_FORMAT: Record<string, ImageFormat> = {
  png: 'png',
  jpg: 'jpeg',
  jpeg: 'jpeg',
  webp: 'webp',
  avif: 'avif',
  tiff: 'tiff',
  tif: 'tiff',
  gif: 'gif'
}

/** Maps a file path's extension to the ImageFormat it corresponds to, if any. */
export function formatFromExtension(path: string): ImageFormat | null {
  const ext = /\.([^./\\]+)$/.exec(path)?.[1]?.toLowerCase()
  return ext ? (EXTENSION_TO_FORMAT[ext] ?? null) : null
}

/**
 * Applies the tuned, format-specific encoder settings to a sharp pipeline —
 * shared by every place that writes an image to disk (convert, enhance),
 * so a fix here doesn't need to be repeated per call site.
 *
 * png and tiff are forced into their real lossless modes: sharp's own
 * defaults quietly quantize png's palette (once a quality value is passed)
 * and jpeg-compress tiff, which throws away data for formats picked
 * specifically because they're not supposed to. webp/avif/gif get their
 * compression effort maxed out for smaller files at the same quality —
 * slower to encode, which a one-off desktop conversion can afford.
 */
export function applyFormatEncoding(
  pipeline: ReturnType<typeof sharp>,
  format: ImageFormat,
  quality?: number
): void {
  switch (format) {
    case 'png':
      pipeline.png({ compressionLevel: 9, adaptiveFiltering: true })
      break
    case 'jpeg':
      pipeline.jpeg(quality ? { quality } : undefined)
      break
    case 'webp':
      pipeline.webp({ effort: 6, ...(quality ? { quality } : {}) })
      break
    case 'avif':
      pipeline.avif({ effort: 6, ...(quality ? { quality } : {}) })
      break
    case 'tiff':
      pipeline.tiff({ compression: 'deflate' })
      break
    case 'gif':
      pipeline.gif({ effort: 10 })
      break
  }
}
