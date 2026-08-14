import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readSettings, setSettingsFilePathForTesting, updateSettings } from './settings'

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'vexel-settings-'))
  setSettingsFilePathForTesting(join(dir, 'settings.json'))
})

afterEach(async () => {
  setSettingsFilePathForTesting(null)
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

describe('readSettings', () => {
  it('returns defaults when no settings file exists yet', async () => {
    expect(await readSettings()).toEqual({ defaultDownloadDir: null })
  })
})

describe('updateSettings', () => {
  it('persists a patch and returns the merged settings', async () => {
    const updated = await updateSettings({ defaultDownloadDir: 'C:/Users/me/Downloads' })

    expect(updated).toEqual({ defaultDownloadDir: 'C:/Users/me/Downloads' })
    expect(await readSettings()).toEqual({ defaultDownloadDir: 'C:/Users/me/Downloads' })
  })

  it('can clear a previously set value back to null', async () => {
    await updateSettings({ defaultDownloadDir: 'C:/Users/me/Downloads' })

    const cleared = await updateSettings({ defaultDownloadDir: null })

    expect(cleared.defaultDownloadDir).toBeNull()
  })
})
