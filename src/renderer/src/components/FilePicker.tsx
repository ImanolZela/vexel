import Button from './ui/Button'
import type { SelectedFile } from '../types/file'

interface FilePickerProps {
  files: SelectedFile[]
  selectedPath: string
  onSelect: (path: string) => void
}

// Vectorizar and Mejorar only ever work on one image at a time, but the
// Dropzone is shared and lets you queue up several — without this, loading
// 3 files and landing here silently processes just the first one with no
// indication that's what happened, or any way to pick a different one.
function FilePicker({ files, selectedPath, onSelect }: FilePickerProps): React.JSX.Element | null {
  if (files.length <= 1) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs text-text-secondary">
        {files.length} archivos cargados, trabajando con:
      </span>
      {files.map((file) => (
        <Button
          key={file.path}
          variant="pill"
          active={file.path === selectedPath}
          onClick={() => onSelect(file.path)}
        >
          {file.name}
        </Button>
      ))}
    </div>
  )
}

export default FilePicker
