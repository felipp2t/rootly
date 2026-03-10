import type { BaseError } from '../base-error.ts'

export class NotAllowedError extends Error implements BaseError {
  constructor(message?: string) {
    super(message ?? 'Not allowed')
  }
}
