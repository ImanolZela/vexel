import { app } from 'electron'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

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

// Capped so a long-running install doesn't grow this file forever — a
// download history is for "what did I just do", not a permanent archive.
const MAX_ENTRIES = 200

// Overridable so tests don't touch the real user's history file.
let historyFileOverride: string | null = null

export function setHistoryFilePathForTesting(path: string | null): void {
  historyFileOverride = path
}

function historyFilePath(): string {
  return historyFileOverride ?? join(app.getPath('userData'), 'history.json')
}

export async function readHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await readFile(historyFilePath(), 'utf-8')
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : []
  } catch {
    // No file yet (first run) or a corrupt one — either way, an empty
    // history is a safe fallback rather than crashing the app over it.
    return []
  }
}

export async function appendHistoryEntry(entry: NewHistoryEntry): Promise<HistoryEntry[]> {
  const history = await readHistory()
  const newEntry: HistoryEntry = { ...entry, id: randomUUID(), timestamp: Date.now() }
  const updated = [newEntry, ...history].slice(0, MAX_ENTRIES)
  await writeHistory(updated)
  return updated
}

export async function removeHistoryEntry(id: string): Promise<HistoryEntry[]> {
  const history = await readHistory()
  const updated = history.filter((entry) => entry.id !== id)
  await writeHistory(updated)
  return updated
}

export async function clearHistory(): Promise<void> {
  await writeHistory([])
}

async function writeHistory(entries: HistoryEntry[]): Promise<void> {
  const path = historyFilePath()
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(entries, null, 2), 'utf-8')
}
