import type { ElectronAPI } from '@electron-toolkit/preload'

export type ConvertResult = { ok: true } | { ok: false; error: string }
export type VectorizeResult = { ok: true; svg: string } | { ok: false; error: string }
export type WriteTextFileResult = { ok: true } | { ok: false; error: string }
export type EnhancePreviewResult = { ok: true; thumbnail: string } | { ok: false; error: string }

// Mirrors main/imaging/convert.ts's ConvertOptions. Kept as a separate
// declaration (rather than imported) so the renderer's tsconfig doesn't have
// to type-check the main process's implementation files.
export interface ConvertRequest {
  sourcePath: string
  destPath: string
  format: 'png' | 'jpeg' | 'webp' | 'avif' | 'tiff' | 'gif'
  quality?: number
  removeBackground?: boolean
}

export interface VectorizeRequest {
  sourcePath: string
  colors: number
  bucketBits?: number
  turdSize?: number
  alphaMax?: number
  optTolerance?: number
  removeBackground?: boolean
}

export interface EnhanceRequest {
  sourcePath: string
  destPath: string
  autoContrast?: boolean
  denoise?: boolean
  sharpen?: boolean
  scale?: number
}

export type EnhancePreviewRequest = Omit<EnhanceRequest, 'destPath'>

// Mirrors main/history.ts.
export type HistoryKind = 'convert' | 'vectorize' | 'enhance'

export interface HistoryEntry {
  id: string
  kind: HistoryKind
  sourceName: string
  destPath: string
  format?: string
  timestamp: number
}

export type NewHistoryEntry = Omit<HistoryEntry, 'id' | 'timestamp'>

// Mirrors main/settings.ts.
export interface Settings {
  defaultDownloadDir: string | null
}

export interface VexelAPI {
  openFiles: () => Promise<string[]>
  saveFile: (defaultName?: string) => Promise<string | null>
  chooseDirectory: () => Promise<string | null>
  getPathForFile: (file: File) => string
  joinPath: (...segments: string[]) => string
  convertImage: (options: ConvertRequest) => Promise<ConvertResult>
  getThumbnail: (path: string) => Promise<string | null>
  vectorizeImage: (options: VectorizeRequest) => Promise<VectorizeResult>
  writeTextFile: (path: string, content: string) => Promise<WriteTextFileResult>
  enhanceImage: (options: EnhanceRequest) => Promise<ConvertResult>
  enhancePreview: (options: EnhancePreviewRequest) => Promise<EnhancePreviewResult>
  showInFolder: (path: string) => Promise<void>
  getHistory: () => Promise<HistoryEntry[]>
  addHistoryEntry: (entry: NewHistoryEntry) => Promise<HistoryEntry[]>
  removeHistoryEntry: (id: string) => Promise<HistoryEntry[]>
  clearHistory: () => Promise<void>
  getSettings: () => Promise<Settings>
  updateSettings: (patch: Partial<Settings>) => Promise<Settings>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: VexelAPI
  }
}
