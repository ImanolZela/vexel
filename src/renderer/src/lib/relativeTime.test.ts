import { describe, expect, it } from 'vitest'
import { formatRelativeTime } from './relativeTime'

describe('formatRelativeTime', () => {
  const now = new Date('2026-08-14T12:00:00Z').getTime()

  it('shows "justo ahora" for anything under a minute', () => {
    expect(formatRelativeTime(now - 30_000, now)).toBe('justo ahora')
  })

  it('shows minutes under an hour', () => {
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe('hace 5 min')
  })

  it('shows hours under a day', () => {
    expect(formatRelativeTime(now - 3 * 60 * 60_000, now)).toBe('hace 3 h')
  })

  it('shows days under a week', () => {
    expect(formatRelativeTime(now - 2 * 24 * 60 * 60_000, now)).toBe('hace 2 d')
  })

  it('falls back to a plain date past a week', () => {
    const result = formatRelativeTime(now - 10 * 24 * 60 * 60_000, now)
    expect(result).not.toContain('hace')
  })

  it('never returns a negative duration for a future timestamp', () => {
    expect(formatRelativeTime(now + 60_000, now)).toBe('justo ahora')
  })
})
