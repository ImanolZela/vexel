import sharp from 'sharp'

export async function createThumbnail(source: string | Buffer, maxSize = 96): Promise<string> {
  const buffer = await sharp(source)
    .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
    .webp()
    .toBuffer()

  return `data:image/webp;base64,${buffer.toString('base64')}`
}
