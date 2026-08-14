import { useCallback, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { useFiles } from './useFiles'

interface FileDropHandlers {
  isDragging: boolean
  onDragEnter: (event: DragEvent<HTMLElement>) => void
  onDragOver: (event: DragEvent<HTMLElement>) => void
  onDragLeave: (event: DragEvent<HTMLElement>) => void
  onDrop: (event: DragEvent<HTMLElement>) => void
}

export function useFileDrop(): FileDropHandlers {
  const { addFiles } = useFiles()
  const [isDragging, setIsDragging] = useState(false)
  // dragenter/dragleave fire on every element boundary the pointer crosses
  // and bubble up, so a plain boolean flickers the overlay on and off as a
  // drag moves across the sidebar, list rows, etc. — each of those firing
  // its own leave before the next element's enter. Counting nesting depth
  // instead means only actually leaving the whole shell hides it.
  const depthRef = useRef(0)

  const onDragEnter = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    depthRef.current += 1
    setIsDragging(true)
  }, [])

  // dragover has to keep calling preventDefault — that's what tells the
  // browser this element is a valid drop target — but it fires continuously
  // while hovering, far more often than any single "enter", so it must not
  // touch depthRef or the counter would never balance against dragleave.
  const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
  }, [])

  const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    depthRef.current = Math.max(0, depthRef.current - 1)
    if (depthRef.current === 0) setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      depthRef.current = 0
      setIsDragging(false)

      const dropped = Array.from(event.dataTransfer.files).map((file) => ({
        path: window.api.getPathForFile(file),
        name: file.name
      }))

      addFiles(dropped)
    },
    [addFiles]
  )

  return { isDragging, onDragEnter, onDragOver, onDragLeave, onDrop }
}
