import { useFiles } from '../hooks/useFiles'
import Button from './ui/Button'
import { UploadIcon } from './icons'

function fileNameFromPath(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

function Dropzone(): React.JSX.Element {
  const { files, addFiles, removeFile } = useFiles()

  async function handleBrowse(): Promise<void> {
    const paths = await window.api.openFiles()
    addFiles(paths.map((path) => ({ path, name: fileNameFromPath(path) })))
  }

  return (
    <div className="mb-6 rounded-xl border-2 border-dashed border-text-secondary/30 p-6 text-center">
      <UploadIcon className="mx-auto mb-2 h-6 w-6 text-text-secondary/60" />
      <p className="mb-3 text-text-secondary">Arrastrá imágenes a cualquier parte de la ventana</p>
      <Button onClick={handleBrowse}>Seleccionar archivos</Button>

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
                title={`Quitar ${file.name}`}
                aria-label={`Quitar ${file.name}`}
                onClick={() => removeFile(file.path)}
                className="cursor-pointer text-text-secondary hover:text-vectorize-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mode-accent)]"
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
