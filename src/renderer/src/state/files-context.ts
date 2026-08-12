import { createContext } from 'react'
import type { SelectedFile } from '../types/file'

export interface FilesState {
  files: SelectedFile[]
}

export type FilesAction =
  { type: 'add'; files: SelectedFile[] } | { type: 'remove'; path: string } | { type: 'clear' }

export function filesReducer(state: FilesState, action: FilesAction): FilesState {
  switch (action.type) {
    case 'add': {
      const existingPaths = new Set(state.files.map((file) => file.path))
      const incoming = action.files.filter((file) => !existingPaths.has(file.path))
      return { files: [...state.files, ...incoming] }
    }
    case 'remove':
      return { files: state.files.filter((file) => file.path !== action.path) }
    case 'clear':
      return { files: [] }
  }
}

export interface FilesContextValue {
  files: SelectedFile[]
  addFiles: (files: SelectedFile[]) => void
  removeFile: (path: string) => void
  clearFiles: () => void
}

export const FilesContext = createContext<FilesContextValue | null>(null)
