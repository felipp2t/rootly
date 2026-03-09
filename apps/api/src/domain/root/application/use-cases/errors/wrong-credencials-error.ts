import type { BaseError } from '@/core/errors/base-error.ts'

export class WrongCredentialsError extends Error implements BaseError {
  constructor() {
    super(`Credentials are not valid.`)
  }
}
