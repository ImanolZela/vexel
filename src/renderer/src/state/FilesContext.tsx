import { useCallback, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import { FilesContext, filesReducer, type FilesContextValue } from './files-context'

export function FilesProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [state, dispatch] = useReducer(filesReducer, { files: [] })

  const addFiles = useCallback((files: FilesContextValue['files']) => {
    dispatch({ type: 'add', files })
  }, [])
  const removeFile = useCallback((path: string) => dispatch({ type: 'remove', path }), [])
  const clearFiles = useCallback(() => dispatch({ type: 'clear' }), [])

  const value = useMemo<FilesContextValue>(
    () => ({ files: state.files, addFiles, removeFile, clearFiles }),
    [state.files, addFiles, removeFile, clearFiles]
  )

  return <FilesContext.Provider value={value}>{children}</FilesContext.Provider>
}
