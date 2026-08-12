import { useCallback, useState } from 'react'
import type { DragEvent } from 'react'
import { useFiles } from './useFiles'

interface FileDropHandlers {
  isDragging: boolean
  onDragOver: (event: DragEvent<HTMLElement>) => void
  onDragLeave: (event: DragEvent<HTMLElement>) => void
  onDrop: (event: DragEvent<HTMLElement>) => void
}

export function useFileDrop(): FileDropHandlers {
  const { addFiles } = useFiles()
  const [isDragging, setIsDragging] = useState(false)

  const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      setIsDragging(false)

      const dropped = Array.from(event.dataTransfer.files).map((file) => ({
        path: window.api.getPathForFile(file),
        name: file.name
      }))

      addFiles(dropped)
    },
    [addFiles]
  )

  return { isDragging, onDragOver, onDragLeave, onDrop }
}
