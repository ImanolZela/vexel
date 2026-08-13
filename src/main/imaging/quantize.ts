import sharp from 'sharp'
import {
  colorDistance,
  detectBackgroundColor,
  floodFillBackgroundMask,
  type RGB
} from './background'

export type { RGB }

export interface QuantizeOptions {
  colors: number
  bucketBits?: number
  detectBackground?: boolean
}

export interface QuantizeResult {
  width: number
  height: number
  palette: RGB[]
  masks: Uint8Array[]
}

export async function quantizeImage(
  sourcePath: string,
  options: QuantizeOptions
): Promise<QuantizeResult> {
  const colors = Math.max(1, options.colors)
  // 5 bits/channel (32 levels) is fine-grained enough that JPEG compression
  // noise splits a single visual color (e.g. one blue) into several distinct
  // buckets, which then out-compete real colors (like skin tones) for a
  // palette slot. 4 bits/channel (16 levels) merges that noise back together.
  const bucketBits = options.bucketBits ?? 4
  const shift = 8 - bucketBits

  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  const pixelCount = width * height

  const buckets = new Map<number, { count: number; r: number; g: number; b: number }>()

  for (let i = 0; i < pixelCount; i++) {
    const offset = i * channels
    const r = data[offset]
    const g = data[offset + 1]
    const b = data[offset + 2]
    const key = ((r >> shift) << (bucketBits * 2)) | ((g >> shift) << bucketBits) | (b >> shift)

    const bucket = buckets.get(key)
    if (bucket) {
      bucket.count += 1
      bucket.r += r
      bucket.g += g
      bucket.b += b
    } else {
      buckets.set(key, { count: 1, r, g, b })
    }
  }

  const palette: RGB[] = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, colors)
    .map((bucket) => ({
      r: Math.round(bucket.r / bucket.count),
      g: Math.round(bucket.g / bucket.count),
      b: Math.round(bucket.b / bucket.count)
    }))

  let masks = palette.map(() => new Uint8Array(pixelCount))

  for (let i = 0; i < pixelCount; i++) {
    const offset = i * channels
    const pixel: RGB = { r: data[offset], g: data[offset + 1], b: data[offset + 2] }

    let bestIndex = 0
    let bestDistance = Infinity
    for (let p = 0; p < palette.length; p++) {
      const distance = colorDistance(pixel, palette[p])
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = p
      }
    }

    masks[bestIndex][i] = 1
  }

  let paletteResult = palette

  if (options.detectBackground) {
    // Only clear pixels connected to the edge, so a detail that merely
    // shares the background's color (dress pattern, teeth, eye highlights)
    // stays put instead of being punched out along with the real background.
    const backgroundColor = detectBackgroundColor(data, width, height, channels)
    const backgroundMask = floodFillBackgroundMask(data, width, height, channels, backgroundColor)
    for (const mask of masks) {
      for (let i = 0; i < pixelCount; i++) {
        if (backgroundMask[i]) mask[i] = 0
      }
    }

    // Drop palette entries left with nothing to draw (typically the
    // background color itself, once its region has been cleared above).
    const keep = masks.map((mask) => mask.includes(1))
    paletteResult = palette.filter((_, index) => keep[index])
    masks = masks.filter((_, index) => keep[index])
  }

  return { width, height, palette: paletteResult, masks }
}
