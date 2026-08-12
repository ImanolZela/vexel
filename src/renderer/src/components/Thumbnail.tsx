import { useThumbnail } from '../hooks/useThumbnail'

interface ThumbnailProps {
  path: string | null
  alt: string
}

function Thumbnail({ path, alt }: ThumbnailProps): React.JSX.Element {
  const dataUrl = useThumbnail(path)

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-bg">
      {dataUrl && <img src={dataUrl} alt={alt} className="h-full w-full object-cover" />}
    </div>
  )
}

export default Thumbnail
