import sharp from 'sharp'
import { Potrace } from 'potrace'

export interface TraceOptions {
  turdSize?: number
  alphaMax?: number
  optTolerance?: number
}

interface PotraceInstance {
  loadImage(image: Buffer, callback: (error: Error | null) => void): void
  getPathTag(fillColor: string): string
}

function maskToPngBuffer(mask: Uint8Array, width: number, height: number): Promise<Buffer> {
  const raw = Buffer.alloc(width * height * 3)

  for (let i = 0; i < mask.length; i++) {
    const value = mask[i] ? 0 : 255
    const offset = i * 3
    raw[offset] = value
    raw[offset + 1] = value
    raw[offset + 2] = value
  }

  return sharp(raw, { raw: { width, height, channels: 3 } })
    .png()
    .toBuffer()
}

export async function traceMaskToPathTag(
  mask: Uint8Array,
  width: number,
  height: number,
  fillColor: string,
  options: TraceOptions = {}
): Promise<string> {
  const png = await maskToPngBuffer(mask, width, height)

  const tracer = new Potrace({
    threshold: 128,
    blackOnWhite: true,
    turdSize: options.turdSize ?? 2,
    alphaMax: options.alphaMax ?? 1,
    optTolerance: options.optTolerance ?? 0.2
  }) as unknown as PotraceInstance

  return new Promise((resolve, reject) => {
    tracer.loadImage(png, (error) => {
      if (error) {
        reject(error)
        return
      }
      resolve(tracer.getPathTag(fillColor))
    })
  })
}
