import sharp from 'sharp'

export interface RGB {
  r: number
  g: number
  b: number
}

export interface QuantizeOptions {
  colors: number
  bucketBits?: number
}

export interface QuantizeResult {
  width: number
  height: number
  palette: RGB[]
  masks: Uint8Array[]
}

function colorDistance(a: RGB, b: RGB): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return dr * dr + dg * dg + db * db
}

export async function quantizeImage(
  sourcePath: string,
  options: QuantizeOptions
): Promise<QuantizeResult> {
  const colors = Math.max(1, options.colors)
  const bucketBits = options.bucketBits ?? 5
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

  const masks = palette.map(() => new Uint8Array(pixelCount))

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

  return { width, height, palette, masks }
}
