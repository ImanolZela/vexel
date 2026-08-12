import type { ElectronAPI } from '@electron-toolkit/preload'
import type { ConvertOptions } from '../main/imaging/convert'

export type ConvertResult = { ok: true } | { ok: false; error: string }
export type VectorizeResult = { ok: true; svg: string } | { ok: false; error: string }
export type WriteTextFileResult = { ok: true } | { ok: false; error: string }
export type EnhancePreviewResult = { ok: true; thumbnail: string } | { ok: false; error: string }

export interface VectorizeRequest {
  sourcePath: string
  colors: number
  bucketBits?: number
  turdSize?: number
  alphaMax?: number
  optTolerance?: number
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

export interface VexelAPI {
  openFiles: () => Promise<string[]>
  saveFile: (defaultName?: string) => Promise<string | null>
  chooseDirectory: () => Promise<string | null>
  getPathForFile: (file: File) => string
  joinPath: (...segments: string[]) => string
  convertImage: (options: ConvertOptions) => Promise<ConvertResult>
  getThumbnail: (path: string) => Promise<string | null>
  vectorizeImage: (options: VectorizeRequest) => Promise<VectorizeResult>
  writeTextFile: (path: string, content: string) => Promise<WriteTextFileResult>
  enhanceImage: (options: EnhanceRequest) => Promise<ConvertResult>
  enhancePreview: (options: EnhancePreviewRequest) => Promise<EnhancePreviewResult>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: VexelAPI
  }
}
