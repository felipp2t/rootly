import type { BaseError } from '../base-error.ts'

export class InvalidPermissionError extends Error implements BaseError {
  constructor(resource: string, action: string) {
    super(`Permission "${resource}:${action}" is not allowed.`)
  }
}
