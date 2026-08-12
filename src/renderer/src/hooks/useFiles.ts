import { useContext } from 'react'
import { FilesContext, type FilesContextValue } from '../state/files-context'

export function useFiles(): FilesContextValue {
  const context = useContext(FilesContext)
  if (!context) {
    throw new Error('useFiles must be used within a FilesProvider')
  }
  return context
}
