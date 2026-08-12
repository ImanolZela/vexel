import { ipcMain } from 'electron'
import { createThumbnail } from '../imaging/thumbnail'

export function registerThumbnailHandlers(): void {
  ipcMain.handle('image:thumbnail', async (_event, path: string): Promise<string | null> => {
    try {
      return await createThumbnail(path)
    } catch {
      return null
    }
  })
}
