const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** "hace 2 min" / "hace 3 h" / "hace 5 d" / a plain date once it's old enough
 * that "ago" stops being useful — matches the kind of timestamp a download
 * history or activity log usually shows. */
export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - timestamp)

  if (diff < MINUTE) return 'justo ahora'
  if (diff < HOUR) return `hace ${Math.floor(diff / MINUTE)} min`
  if (diff < DAY) return `hace ${Math.floor(diff / HOUR)} h`
  if (diff < 7 * DAY) return `hace ${Math.floor(diff / DAY)} d`

  return new Date(timestamp).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
