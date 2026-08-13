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

// Distance radius (in RGB space) treated as "background", plus a soft ramp
// around the edge so a cutout doesn't look jagged.
const REMOVE_TOLERANCE = 36
const REMOVE_FEATHER = 24

/**
 * Flood-fills outward from every border cell where `isBackground` is true,
 * expanding across 4-connected neighbors that also satisfy it. A cell deep
 * inside the image that merely satisfies `isBackground` in isolation —
 * a white dress pattern, the whites of an eye — is left alone unless it's
 * actually reachable from the edge without crossing a cell that doesn't.
 */
export function floodFillFromBorder(
  width: number,
  height: number,
  isBackground: (index: number) => boolean
): Uint8Array {
  const pixelCount = width * height
  const mask = new Uint8Array(pixelCount) // 1 = part of the background region
  const visited = new Uint8Array(pixelCount)
  const queue = new Int32Array(pixelCount)
  let head = 0
  let tail = 0

  function tryEnqueue(i: number): void {
    if (visited[i]) return
    visited[i] = 1
    if (isBackground(i)) {
      mask[i] = 1
      queue[tail++] = i
    }
  }

  for (let x = 0; x < width; x++) {
    tryEnqueue(x)
    tryEnqueue((height - 1) * width + x)
  }
  for (let y = 0; y < height; y++) {
    tryEnqueue(y * width)
    tryEnqueue(y * width + width - 1)
  }

  while (head < tail) {
    const i = queue[head++]
    const x = i % width
    const y = (i / width) | 0
    if (x > 0) tryEnqueue(i - 1)
    if (x < width - 1) tryEnqueue(i + 1)
    if (y > 0) tryEnqueue(i - width)
    if (y < height - 1) tryEnqueue(i + width)
  }

  return mask
}

/**
 * Flood-fills outward from every border pixel that's close to `background`,
 * expanding across 4-connected neighbors that are also close to it. This
 * finds the actual background region — unlike a plain color match, it won't
 * grab a white dress pattern, the whites of an eye, or any other detail deep
 * inside the subject that merely happens to share the background's color,
 * because those aren't reachable from the edge without crossing pixels of a
 * different color.
 */
export function floodFillBackgroundMask(
  data: Uint8Array | Buffer,
  width: number,
  height: number,
  channels: number,
  background: RGB,
  tolerance = REMOVE_TOLERANCE
): Uint8Array {
  return floodFillFromBorder(width, height, (i) => {
    const offset = i * channels
    const pixel = { r: data[offset], g: data[offset + 1], b: data[offset + 2] }
    return Math.sqrt(colorDistance(pixel, background)) <= tolerance
  })
}

/**
 * Returns an RGBA buffer where the flood-filled background region fades to
 * transparent, with a soft ramp near its edge instead of a hard cut. Pixels
 * outside that region stay fully opaque even if their color happens to
 * match the background elsewhere in the image.
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
  // Flood-fill with the feather band included so the ramp itself is covered.
  const backgroundMask = floodFillBackgroundMask(
    data,
    width,
    height,
    channels,
    background,
    tolerance + feather
  )
  const out = Buffer.alloc(pixelCount * 4)

  for (let i = 0; i < pixelCount; i++) {
    const offset = i * channels
    const r = data[offset]
    const g = data[offset + 1]
    const b = data[offset + 2]
    const sourceAlpha = channels === 4 ? data[offset + 3] : 255

    const outOffset = i * 4
    out[outOffset] = r
    out[outOffset + 1] = g
    out[outOffset + 2] = b

    if (!backgroundMask[i]) {
      out[outOffset + 3] = sourceAlpha
      continue
    }

    const distance = Math.sqrt(colorDistance({ r, g, b }, background))
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
