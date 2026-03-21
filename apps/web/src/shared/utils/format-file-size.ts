export function formatFileSize(bytes: number): string {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'narrow'
  }).format(bytes)
}