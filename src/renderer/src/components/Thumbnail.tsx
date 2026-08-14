import { useThumbnail } from '../hooks/useThumbnail'
import { THUMBNAIL_SIZE_CLASSES, type ThumbnailSize } from '../lib/thumbnailSize'

interface ThumbnailProps {
  path: string | null
  alt: string
  size?: ThumbnailSize
}

function Thumbnail({ path, alt, size = 'sm' }: ThumbnailProps): React.JSX.Element {
  const dataUrl = useThumbnail(path)

  return (
    <div
      className={`flex ${THUMBNAIL_SIZE_CLASSES[size]} shrink-0 items-center justify-center overflow-hidden rounded-md bg-bg`}
    >
      {dataUrl && <img src={dataUrl} alt={alt} className="h-full w-full object-cover" />}
    </div>
  )
}

export default Thumbnail
