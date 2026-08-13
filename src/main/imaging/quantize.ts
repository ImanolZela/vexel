import sharp from 'sharp'
import { colorDistance, detectBackgroundColor, floodFillFromBorder, type RGB } from './background'

export type { RGB }

export interface QuantizeOptions {
  colors: number
  bucketBits?: number
  detectBackground?: boolean
  blurSigma?: number
}

export interface QuantizeResult {
  width: number
  height: number
  palette: RGB[]
  masks: Uint8Array[]
}

// Distance (in RGB space) under which two frequency buckets count as the
// same visual color and get merged instead of each claiming a palette slot.
// Picking the N most frequent buckets outright lets several near-duplicate
// shades of one big region (JPEG noise across a large blue area) crowd out
// a real but smaller color (a mauve ear, a wooden guitar) entirely.
const PALETTE_MERGE_TOLERANCE = 30

interface WeightedColor extends RGB {
  count: number
}

function buildPalette(
  buckets: Map<number, { count: number; r: number; g: number; b: number }>,
  colors: number
): RGB[] {
  const sorted: WeightedColor[] = [...buckets.values()]
    .map((bucket) => ({
      r: bucket.r / bucket.count,
      g: bucket.g / bucket.count,
      b: bucket.b / bucket.count,
      count: bucket.count
    }))
    .sort((a, b) => b.count - a.count)

  const mergeRadius = PALETTE_MERGE_TOLERANCE * PALETTE_MERGE_TOLERANCE
  const palette: WeightedColor[] = []

  for (const bucket of sorted) {
    let nearest: WeightedColor | null = null
    let nearestDistance = Infinity
    for (const entry of palette) {
      const distance = colorDistance(bucket, entry)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearest = entry
      }
    }

    if (nearest && nearestDistance <= mergeRadius) {
      const total = nearest.count + bucket.count
      nearest.r = (nearest.r * nearest.count + bucket.r * bucket.count) / total
      nearest.g = (nearest.g * nearest.count + bucket.g * bucket.count) / total
      nearest.b = (nearest.b * nearest.count + bucket.b * bucket.count) / total
      nearest.count = total
    } else if (palette.length < colors) {
      palette.push({ ...bucket })
    }
    // Otherwise the palette is full and this bucket isn't close to any
    // accepted color — it's dropped here, but its pixels still get assigned
    // to their nearest final palette color in the per-pixel pass below.
  }

  return palette
    .sort((a, b) => b.count - a.count)
    .map((entry) => ({ r: Math.round(entry.r), g: Math.round(entry.g), b: Math.round(entry.b) }))
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
  // A source photo's anti-aliased edges sit between two flat colors, so
  // nearest-color assignment flips back and forth pixel by pixel along
  // every boundary, tracing as a speckled, dotted line instead of a clean
  // curve. A slight pre-blur collapses that noisy transition band before
  // classification, without visibly softening real detail.
  const blurSigma = options.blurSigma ?? 0.6

  let pipeline = sharp(sourcePath).ensureAlpha()
  if (blurSigma > 0) pipeline = pipeline.blur(blurSigma)

  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true })

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

  const palette = buildPalette(buckets, colors)

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
    // Flood-fill over the *classification itself* — is this pixel already
    // assigned to the background-like palette color, and connected to the
    // edge — rather than re-testing raw pixel color against a separate
    // tolerance. That keeps this exactly consistent with what actually gets
    // drawn, so a blurred edge can't leave a thin ring that's neither
    // clearly background nor clearly foreground half-cleared.
    const backgroundColor = detectBackgroundColor(data, width, height, channels)
    let backgroundIndex = 0
    let backgroundDistance = Infinity
    for (let p = 0; p < palette.length; p++) {
      const distance = colorDistance(palette[p], backgroundColor)
      if (distance < backgroundDistance) {
        backgroundDistance = distance
        backgroundIndex = p
      }
    }

    const backgroundMask = masks[backgroundIndex]
    const connected = floodFillFromBorder(width, height, (i) => backgroundMask[i] === 1)
    for (let i = 0; i < pixelCount; i++) {
      if (connected[i]) backgroundMask[i] = 0
    }

    // Drop palette entries left with nothing to draw (typically the
    // background color itself, once its region has been cleared above).
    const keep = masks.map((mask) => mask.includes(1))
    paletteResult = palette.filter((_, index) => keep[index])
    masks = masks.filter((_, index) => keep[index])
  }

  return { width, height, palette: paletteResult, masks }
}
