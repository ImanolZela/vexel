import { useThumbnail } from '../hooks/useThumbnail'

const SIZE_CLASSES = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-24 w-24'
} as const

interface ThumbnailProps {
  path: string | null
  alt: string
  size?: keyof typeof SIZE_CLASSES
}

function Thumbnail({ path, alt, size = 'sm' }: ThumbnailProps): React.JSX.Element {
  const dataUrl = useThumbnail(path)

  return (
    <div
      className={`flex ${SIZE_CLASSES[size]} shrink-0 items-center justify-center overflow-hidden rounded-md bg-bg`}
    >
      {dataUrl && <img src={dataUrl} alt={alt} className="h-full w-full object-cover" />}
    </div>
  )
}

export default Thumbnail
