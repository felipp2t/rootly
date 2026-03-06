import type { BaseError } from '@/core/errors/base-error.ts'

export class FolderNotFoundError extends Error implements BaseError {
  constructor() {
    super('Folder not found.')
  }
}
