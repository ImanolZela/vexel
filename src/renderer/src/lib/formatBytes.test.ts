import { describe, expect, it } from 'vitest'
import { formatBytes } from './formatBytes'

describe('formatBytes', () => {
  it('formats sizes under 1kb in bytes', () => {
    expect(formatBytes(512)).toBe('512 B')
  })

  it('formats sizes under 1mb in kilobytes', () => {
    expect(formatBytes(2048)).toBe('2.0 KB')
  })

  it('formats large sizes in megabytes', () => {
    expect(formatBytes(1024 * 1024 * 2.5)).toBe('2.5 MB')
  })
})
