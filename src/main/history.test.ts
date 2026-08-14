import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  appendHistoryEntry,
  clearHistory,
  readHistory,
  removeHistoryEntry,
  setHistoryFilePathForTesting
} from './history'

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'vexel-history-'))
  setHistoryFilePathForTesting(join(dir, 'history.json'))
})

afterEach(async () => {
  setHistoryFilePathForTesting(null)
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

describe('readHistory', () => {
  it('returns an empty array when no history file exists yet', async () => {
    expect(await readHistory()).toEqual([])
  })
})

describe('appendHistoryEntry', () => {
  it('adds an entry with a generated id and timestamp, newest first', async () => {
    await appendHistoryEntry({
      kind: 'convert',
      sourceName: 'cat.png',
      destPath: 'C:/out/cat.webp',
      format: 'webp'
    })
    const history = await appendHistoryEntry({
      kind: 'vectorize',
      sourceName: 'dog.jpg',
      destPath: 'C:/out/dog.svg'
    })

    expect(history).toHaveLength(2)
    expect(history[0].sourceName).toBe('dog.jpg')
    expect(history[0].id).toBeTruthy()
    expect(history[0].timestamp).toBeGreaterThan(0)
    expect(history[1].sourceName).toBe('cat.png')
  })

  it('persists across separate reads', async () => {
    await appendHistoryEntry({ kind: 'enhance', sourceName: 'a.png', destPath: 'C:/out/a.png' })

    expect(await readHistory()).toHaveLength(1)
  })

  it('caps the history at 200 entries, dropping the oldest', async () => {
    for (let i = 0; i < 205; i++) {
      await appendHistoryEntry({
        kind: 'convert',
        sourceName: `f${i}.png`,
        destPath: `C:/out/f${i}.png`
      })
    }

    const history = await readHistory()
    expect(history).toHaveLength(200)
    expect(history[0].sourceName).toBe('f204.png')
    expect(history[199].sourceName).toBe('f5.png')
  })
})

describe('removeHistoryEntry', () => {
  it('removes only the matching entry', async () => {
    await appendHistoryEntry({ kind: 'convert', sourceName: 'a.png', destPath: 'C:/out/a.png' })
    const [second] = await appendHistoryEntry({
      kind: 'convert',
      sourceName: 'b.png',
      destPath: 'C:/out/b.png'
    })

    const remaining = await removeHistoryEntry(second.id)

    expect(remaining).toHaveLength(1)
    expect(remaining[0].sourceName).toBe('a.png')
  })
})

describe('clearHistory', () => {
  it('empties the history', async () => {
    await appendHistoryEntry({ kind: 'convert', sourceName: 'a.png', destPath: 'C:/out/a.png' })

    await clearHistory()

    expect(await readHistory()).toEqual([])
  })
})
