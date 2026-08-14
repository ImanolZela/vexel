export const IMAGE_FORMATS = ['png', 'jpeg', 'webp', 'avif', 'tiff', 'gif'] as const

export type ImageFormat = (typeof IMAGE_FORMATS)[number]

// jpeg has no alpha channel, so "quitar fondo" has nothing to make transparent.
export const FORMATS_SUPPORTING_ALPHA: ImageFormat[] = ['png', 'webp', 'avif', 'tiff', 'gif']

// png and tiff are always encoded lossless (no palette/jpeg quantization)
// and gif has no quality knob in sharp — the quality slider wouldn't do
// anything for any of the three.
export const FORMATS_WITHOUT_QUALITY: ImageFormat[] = ['png', 'tiff', 'gif']

const EXTENSION_BY_FORMAT: Record<ImageFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
  webp: 'webp',
  avif: 'avif',
  tiff: 'tiff',
  gif: 'gif'
}

export function suggestedFileName(sourceName: string, format: ImageFormat): string {
  const baseName = sourceName.replace(/\.[^./\\]+$/, '')
  return `${baseName}_vexel.${EXTENSION_BY_FORMAT[format]}`
}
