import type { BaseError } from '@/core/errors/base-error.ts'

export class InvalidFolderNameError extends Error implements BaseError {
  constructor(message?: string) {
    super(
      message ??
        'Invalid folder name. Folder name must be between 3 and 32 characters long.',
    )
  }
}
