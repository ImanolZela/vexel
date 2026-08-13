import { quantizeImage, type RGB } from './quantize'
import { traceMaskToPathTag, type TraceOptions } from './trace'

export interface VectorizeOptions extends TraceOptions {
  colors: number
  bucketBits?: number
  removeBackground?: boolean
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (value: number): string => value.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export async function vectorizeImage(
  sourcePath: string,
  options: VectorizeOptions
): Promise<string> {
  const { colors, bucketBits, removeBackground, ...traceOptions } = options
  const { width, height, palette, masks, backgroundIndex } = await quantizeImage(sourcePath, {
    colors,
    bucketBits,
    detectBackground: removeBackground
  })

  const pathTags = await Promise.all(
    palette
      .map((color, index) => ({ color, index }))
      .filter(({ index }) => index !== backgroundIndex)
      .map(({ color, index }) =>
        traceMaskToPathTag(masks[index], width, height, rgbToHex(color), traceOptions)
      )
  )

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
    `width="${width}" height="${height}">${pathTags.join('')}</svg>`
  )
}
