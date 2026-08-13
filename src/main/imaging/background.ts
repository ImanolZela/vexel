export interface RGB {
  r: number
  g: number
  b: number
}

export function colorDistance(a: RGB, b: RGB): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return dr * dr + dg * dg + db * db
}

const CORNER_SAMPLE = 4

/**
 * Averages small squares sampled at each of the four corners, on the
 * assumption that a flat background touches all of them — the common case
 * for stickers, cutouts and product photos on a plain backdrop.
 */
export function detectBackgroundColor(
  data: Uint8Array | Buffer,
  width: number,
  height: number,
  channels: number
): RGB {
  const size = Math.max(1, Math.min(CORNER_SAMPLE, width, height))
  const corners: Array<[number, number]> = [
    [0, 0],
    [width - size, 0],
    [0, height - size],
    [width - size, height - size]
  ]

  let r = 0
  let g = 0
  let b = 0
  let count = 0

  for (const [startX, startY] of corners) {
    for (let y = startY; y < startY + size; y++) {
      for (let x = startX; x < startX + size; x++) {
        const offset = (y * width + x) * channels
        r += data[offset]
        g += data[offset + 1]
        b += data[offset + 2]
        count++
      }
    }
  }

  return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) }
}

// Squared-distance radius (in RGB space) treated as "background", plus a
// soft ramp around the edge so the cutout doesn't look jagged.
const REMOVE_TOLERANCE = 36
const REMOVE_FEATHER = 24

/**
 * Returns an RGBA buffer where pixels close to `background` fade to
 * transparent, with a soft ramp near the threshold instead of a hard cut.
 */
export function stripBackground(
  data: Uint8Array | Buffer,
  width: number,
  height: number,
  channels: number,
  background: RGB,
  tolerance = REMOVE_TOLERANCE,
  feather = REMOVE_FEATHER
): Buffer {
  const pixelCount = width * height
  const out = Buffer.alloc(pixelCount * 4)

  for (let i = 0; i < pixelCount; i++) {
    const offset = i * channels
    const r = data[offset]
    const g = data[offset + 1]
    const b = data[offset + 2]
    const sourceAlpha = channels === 4 ? data[offset + 3] : 255

    const distance = Math.sqrt(colorDistance({ r, g, b }, background))
    const outOffset = i * 4
    out[outOffset] = r
    out[outOffset + 1] = g
    out[outOffset + 2] = b

    if (distance <= tolerance) {
      out[outOffset + 3] = 0
    } else if (distance < tolerance + feather) {
      out[outOffset + 3] = Math.round(((distance - tolerance) / feather) * sourceAlpha)
    } else {
      out[outOffset + 3] = sourceAlpha
    }
  }

  return out
}
