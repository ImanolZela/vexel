import { app } from 'electron'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

export interface Settings {
  // null = ask every time (the original behavior). Set once here, Convertir
  // stops prompting per batch; Vectorizar/Mejorar's save dialog opens
  // there by default but still lets you pick the exact file each time.
  defaultDownloadDir: string | null
}

const DEFAULT_SETTINGS: Settings = { defaultDownloadDir: null }

let settingsFileOverride: string | null = null

export function setSettingsFilePathForTesting(path: string | null): void {
  settingsFileOverride = path
}

function settingsFilePath(): string {
  return settingsFileOverride ?? join(app.getPath('userData'), 'settings.json')
}

export async function readSettings(): Promise<Settings> {
  try {
    const raw = await readFile(settingsFilePath(), 'utf-8')
    const parsed: unknown = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...(typeof parsed === 'object' && parsed ? parsed : {}) }
  } catch {
    // No file yet (first run) or a corrupt one — defaults are a safe
    // fallback rather than crashing the app over it.
    return DEFAULT_SETTINGS
  }
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await readSettings()
  const updated = { ...current, ...patch }

  const path = settingsFilePath()
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(updated, null, 2), 'utf-8')

  return updated
}
