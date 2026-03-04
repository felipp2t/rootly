import type { BaseError } from '@/core/errors/base-error.ts'

export class FolderAlreadyExistsError extends Error implements BaseError {
  constructor() {
    super('Folder with the same name already exists in the same parent folder')
  }
}
