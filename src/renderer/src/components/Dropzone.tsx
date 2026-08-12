import { useFiles } from '../hooks/useFiles'
import { useFileDrop } from '../hooks/useFileDrop'

function fileNameFromPath(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

function Dropzone(): React.JSX.Element {
  const { files, addFiles, removeFile } = useFiles()
  const { isDragging, onDragOver, onDragLeave, onDrop } = useFileDrop()

  async function handleBrowse(): Promise<void> {
    const paths = await window.api.openFiles()
    addFiles(paths.map((path) => ({ path, name: fileNameFromPath(path) })))
  }

  return (
    <div
      data-dragging={isDragging}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="mb-6 rounded-xl border-2 border-dashed border-text-secondary/30 p-6 text-center data-[dragging=true]:border-accent data-[dragging=true]:bg-accent/10"
    >
      <p className="mb-3 text-text-secondary">Arrastrá imágenes acá</p>
      <button
        type="button"
        onClick={handleBrowse}
        className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg"
      >
        Seleccionar archivos
      </button>

      {files.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2 text-left">
          {files.map((file) => (
            <li
              key={file.path}
              className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm text-text"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                aria-label={`Quitar ${file.name}`}
                onClick={() => removeFile(file.path)}
                className="cursor-pointer text-text-secondary hover:text-vectorize"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Dropzone
