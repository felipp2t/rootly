import type { BaseError } from '@/core/errors/base-error.ts'

export class EmailAlreadyExistsError extends Error implements BaseError {
  constructor(identifier: string) {
    super(`${identifier} already exists.`)
  }
}
