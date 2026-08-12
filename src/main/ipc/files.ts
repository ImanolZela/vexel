import { dialog, ipcMain, type BrowserWindow } from 'electron'

const IMAGE_FILTERS = [
  { name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'tiff', 'gif', 'svg'] }
]

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
}
