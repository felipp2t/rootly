import type { BaseError } from '../base-error.ts'

export class ResourceNotFoundError extends Error implements BaseError {
  constructor() {
    super('Resource not found')
  }
}
