import { useEffect, useState } from 'react'

interface ThumbnailResult {
  path: string | null
  url: string | null
}

export function useThumbnail(path: string | null): string | null {
  const [result, setResult] = useState<ThumbnailResult>({ path: null, url: null })

  useEffect(() => {
    if (!path) return

    let cancelled = false

    window.api.getThumbnail(path).then((url) => {
      if (!cancelled) setResult({ path, url })
    })

    return () => {
      cancelled = true
    }
  }, [path])

  return result.path === path ? result.url : null
}
