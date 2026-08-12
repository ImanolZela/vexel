import type { ElectronAPI } from '@electron-toolkit/preload'
import type { ConvertOptions } from '../main/imaging/convert'

export type ConvertResult = { ok: true } | { ok: false; error: string }

export interface VexelAPI {
  openFiles: () => Promise<string[]>
  saveFile: (defaultName?: string) => Promise<string | null>
  getPathForFile: (file: File) => string
  convertImage: (options: ConvertOptions) => Promise<ConvertResult>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: VexelAPI
  }
}
