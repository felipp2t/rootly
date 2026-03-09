import type { BaseError } from '@/core/errors/base-error.ts'

export class TagNotFoundError extends Error implements BaseError {
  constructor() {
    super('Tag not found.')
  }
}
