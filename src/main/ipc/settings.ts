import { ipcMain } from 'electron'
import { readSettings, updateSettings, type Settings } from '../settings'

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', async (): Promise<Settings> => {
    return readSettings()
  })

  ipcMain.handle('settings:update', async (_event, patch: Partial<Settings>): Promise<Settings> => {
    return updateSettings(patch)
  })
}
