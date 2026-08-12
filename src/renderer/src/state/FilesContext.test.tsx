import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ReactNode } from 'react'
import { FilesProvider } from './FilesContext'
import { useFiles } from '../hooks/useFiles'

function wrapper({ children }: { children: ReactNode }): React.JSX.Element {
  return <FilesProvider>{children}</FilesProvider>
}

describe('FilesContext', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useFiles(), { wrapper })
    expect(result.current.files).toEqual([])
  })

  it('adds files and dedupes by path', () => {
    const { result } = renderHook(() => useFiles(), { wrapper })

    act(() => {
      result.current.addFiles([{ path: 'a.png', name: 'a.png' }])
    })
    act(() => {
      result.current.addFiles([
        { path: 'a.png', name: 'a.png' },
        { path: 'b.png', name: 'b.png' }
      ])
    })

    expect(result.current.files.map((file) => file.path)).toEqual(['a.png', 'b.png'])
  })

  it('removes a file by path', () => {
    const { result } = renderHook(() => useFiles(), { wrapper })

    act(() => {
      result.current.addFiles([{ path: 'a.png', name: 'a.png' }])
    })
    act(() => {
      result.current.removeFile('a.png')
    })

    expect(result.current.files).toEqual([])
  })

  it('clears all files', () => {
    const { result } = renderHook(() => useFiles(), { wrapper })

    act(() => {
      result.current.addFiles([
        { path: 'a.png', name: 'a.png' },
        { path: 'b.png', name: 'b.png' }
      ])
    })
    act(() => {
      result.current.clearFiles()
    })

    expect(result.current.files).toEqual([])
  })
})
