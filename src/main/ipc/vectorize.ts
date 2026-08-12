import { ipcMain } from 'electron'
import { vectorizeImage } from '../imaging/vectorize'
import type { VectorizeRequest, VectorizeResult } from '../../preload/api.d'

export function registerVectorizeHandlers(): void {
  ipcMain.handle(
    'image:vectorize',
    async (_event, request: VectorizeRequest): Promise<VectorizeResult> => {
      try {
        const { sourcePath, ...options } = request
        const svg = await vectorizeImage(sourcePath, options)
        return { ok: true, svg }
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )
}
