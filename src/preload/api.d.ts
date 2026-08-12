import type { ElectronAPI } from '@electron-toolkit/preload'

export type VexelAPI = Record<string, never>

declare global {
  interface Window {
    electron: ElectronAPI
    api: VexelAPI
  }
}
