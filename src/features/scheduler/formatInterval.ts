export function formatInterval(minutes: number): string {
  const value = Math.max(1, Math.round(minutes))

  if (value < 60) return `${value}m`

  const hours = Math.round(value / 60)
  if (value < 24 * 60) return `${hours}h`

  const days = Math.round(value / (24 * 60))
  if (value < 30 * 24 * 60) return `${days}d`

  const months = Math.round(value / (30 * 24 * 60))
  if (value < 12 * 30 * 24 * 60) return `${months}mo`

  const years = Math.round(value / (365 * 24 * 60))
  return `${Math.max(1, years)}y`
}
