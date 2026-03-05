import type { BaseError } from '@/core/errors/base-error.ts'

export class UserAlreadyExistsError extends Error implements BaseError {
  constructor(identifier: string) {
    super(`User "${identifier}" already exists.`)
  }
}
