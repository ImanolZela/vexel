import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { join } from 'node:path'
import { electronAPI } from '@electron-toolkit/preload'
import type { VexelAPI } from './api.d.ts'

const api: VexelAPI = {
  openFiles: () => ipcRenderer.invoke('dialog:open-files'),
  saveFile: (defaultName) => ipcRenderer.invoke('dialog:save-file', defaultName),
  chooseDirectory: () => ipcRenderer.invoke('dialog:choose-directory'),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  joinPath: (...segments) => join(...segments),
  convertImage: (options) => ipcRenderer.invoke('image:convert', options),
  getThumbnail: (path) => ipcRenderer.invoke('image:thumbnail', path),
  vectorizeImage: (options) => ipcRenderer.invoke('image:vectorize', options),
  writeTextFile: (path, content) => ipcRenderer.invoke('file:write-text', path, content),
  enhanceImage: (options) => ipcRenderer.invoke('image:enhance', options),
  enhancePreview: (options) => ipcRenderer.invoke('image:enhance-preview', options)
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} else {
  window.electron = electronAPI
  window.api = api
}
