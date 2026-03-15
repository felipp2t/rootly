import { formatRelative } from 'date-fns'

export function formatTimeAgo(date: Date) {
  return formatRelative(date, new Date())
}
