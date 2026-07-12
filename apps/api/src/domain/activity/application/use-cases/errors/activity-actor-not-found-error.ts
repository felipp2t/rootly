import type { BaseError } from '@/core/errors/base-error.ts'

export class ActivityActorNotFoundError extends Error implements BaseError {
  constructor() {
    super('Activity actor not found.')
  }
}
