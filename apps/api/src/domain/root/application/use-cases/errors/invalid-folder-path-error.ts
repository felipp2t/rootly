import type { BaseError } from '@/core/errors/base-error.ts'

export class InvalidFolderPathError extends Error implements BaseError {
  constructor() {
    super('Invalid folder path.')
  }
}
