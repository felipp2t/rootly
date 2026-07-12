import type { BaseError } from '@/core/errors/base-error.ts'

export class ItemAlreadyArchivedError extends Error implements BaseError {
  constructor() {
    super('Item is already archived.')
  }
}
