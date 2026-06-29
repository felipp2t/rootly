import type { BaseError } from '@/core/errors/base-error.ts'

export class FolderTagLimitReachedError extends Error implements BaseError {
  constructor() {
    super('Folder cannot have more than 3 tags.')
  }
}
