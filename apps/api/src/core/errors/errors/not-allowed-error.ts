import type { BaseError } from '../base-error.ts'

export class NotAllowedError extends Error implements BaseError {
  constructor() {
    super('Not allowed')
  }
}
