export type TagColor = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow'

export const TAG_COLOR_MAP: Record<TagColor, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-blue-500' },
  green: { bg: 'bg-green-500', text: 'text-green-500' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-500' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-500' },
  red: { bg: 'bg-red-500', text: 'text-red-500' },
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500' },
}
