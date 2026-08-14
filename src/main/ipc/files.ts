import { dialog, ipcMain, shell, type BrowserWindow } from 'electron'
import { writeFile } from 'node:fs/promises'

const IMAGE_FILTERS = [
  { name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'tiff', 'gif', 'svg'] }
]

export type WriteTextFileResult = { ok: true } | { ok: false; error: string }

export function registerFileHandlers(getWindow: () => BrowserWindow | null): void {
  ipcMain.handle('dialog:open-files', async () => {
    const window = getWindow()
    if (!window) return []

    const result = await dialog.showOpenDialog(window, {
      properties: ['openFile', 'multiSelections'],
      filters: IMAGE_FILTERS
    })

    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle('dialog:save-file', async (_event, defaultName?: string) => {
    const window = getWindow()
    if (!window) return null

    const result = await dialog.showSaveDialog(window, {
      defaultPath: defaultName,
      filters: IMAGE_FILTERS
    })

    return result.canceled || !result.filePath ? null : result.filePath
  })

  ipcMain.handle('dialog:choose-directory', async () => {
    const window = getWindow()
    if (!window) return null

    const result = await dialog.showOpenDialog(window, {
      properties: ['openDirectory', 'createDirectory']
    })

    return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0]
  })

  ipcMain.handle(
    'file:write-text',
    async (_event, path: string, content: string): Promise<WriteTextFileResult> => {
      try {
        await writeFile(path, content, 'utf8')
        return { ok: true }
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  // Used by the history panel's "Mostrar en carpeta" — highlights the file
  // in the OS file manager instead of just opening the folder blind.
  ipcMain.handle('shell:show-in-folder', async (_event, path: string): Promise<void> => {
    shell.showItemInFolder(path)
  })
}
