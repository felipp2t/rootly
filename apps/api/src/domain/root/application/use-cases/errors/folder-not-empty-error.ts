import type { BaseError } from '@/core/errors/base-error.ts'

export class FolderNotEmptyError extends Error implements BaseError {
  constructor(message?: string) {
    super(message ?? 'Folder is not empty.')
  }
}
