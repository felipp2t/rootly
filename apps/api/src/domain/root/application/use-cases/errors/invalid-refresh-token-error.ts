import type { BaseError } from '@/core/errors/base-error.ts'

export class InvalidRefreshTokenError extends Error implements BaseError {
  constructor() {
    super('Invalid or expired refresh token.')
  }
}
