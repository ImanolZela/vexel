import { ipcMain } from 'electron'
import { enhanceImage, enhanceImagePreview } from '../imaging/enhance'
import type {
  ConvertResult,
  EnhancePreviewRequest,
  EnhancePreviewResult,
  EnhanceRequest
} from '../../preload/api.d'

export function registerEnhanceHandlers(): void {
  ipcMain.handle(
    'image:enhance',
    async (_event, request: EnhanceRequest): Promise<ConvertResult> => {
      try {
        const { sourcePath, destPath, ...options } = request
        await enhanceImage(sourcePath, destPath, options)
        return { ok: true }
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  ipcMain.handle(
    'image:enhance-preview',
    async (_event, request: EnhancePreviewRequest): Promise<EnhancePreviewResult> => {
      try {
        const { sourcePath, ...options } = request
        const thumbnail = await enhanceImagePreview(sourcePath, options)
        return { ok: true, thumbnail }
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )
}
