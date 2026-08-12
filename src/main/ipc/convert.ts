import { ipcMain } from 'electron'
import { convertImage, type ConvertOptions } from '../imaging/convert'
import type { ConvertResult } from '../../preload/api.d'

export function registerConvertHandlers(): void {
  ipcMain.handle(
    'image:convert',
    async (_event, options: ConvertOptions): Promise<ConvertResult> => {
      try {
        await convertImage(options)
        return { ok: true }
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )
}
