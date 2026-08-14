import { ipcMain } from 'electron'
import {
  appendHistoryEntry,
  clearHistory,
  readHistory,
  removeHistoryEntry,
  type HistoryEntry,
  type NewHistoryEntry
} from '../history'

export function registerHistoryHandlers(): void {
  ipcMain.handle('history:get', async (): Promise<HistoryEntry[]> => {
    return readHistory()
  })

  ipcMain.handle('history:add', async (_event, entry: NewHistoryEntry): Promise<HistoryEntry[]> => {
    return appendHistoryEntry(entry)
  })

  ipcMain.handle('history:remove', async (_event, id: string): Promise<HistoryEntry[]> => {
    return removeHistoryEntry(id)
  })

  ipcMain.handle('history:clear', async (): Promise<void> => {
    await clearHistory()
  })
}
