import type { BaseError } from '../base-error.ts'

export class ResourceNotFoundError extends Error implements BaseError {
  constructor(resource?: string) {
    super(`${resource || 'Resource'} not found`)
  }
}
