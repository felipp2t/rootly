import type { BaseError } from '@/core/errors/base-error.ts'

export class InvalidProfileNameError extends Error implements BaseError {
  constructor() {
    super('Invalid profile name. Name must be at least 3 characters long.')
  }
}
