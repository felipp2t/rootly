export class UniqueConstraintViolationError extends Error {
  constructor(public readonly constraint: string) {
    super(`Unique constraint "${constraint}" violated.`)
    this.name = 'UniqueConstraintViolationError'
  }
}

export function isPgUniqueViolation(
  error: unknown,
): error is { code: '23505'; constraint?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === '23505'
  )
}
