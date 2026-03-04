import type { BaseError } from '@/core/errors/base-error.ts'

export class InvalidItemTitleError extends Error implements BaseError {
  constructor(message?: string) {
    super(
      message ??
        'Invalid item title. Item title must be between 3 and 32 characters long.',
    )
  }
}
