import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { VexelAPI } from './api.d.ts'

const api: VexelAPI = {
  openFiles: () => ipcRenderer.invoke('dialog:open-files'),
  saveFile: (defaultName) => ipcRenderer.invoke('dialog:save-file', defaultName),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  convertImage: (options) => ipcRenderer.invoke('image:convert', options)
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} else {
  window.electron = electronAPI
  window.api = api
}
