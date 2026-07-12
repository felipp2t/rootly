import type { BaseError } from '@/core/errors/base-error.ts'

export class ItemNotArchivedError extends Error implements BaseError {
  constructor(message?: string) {
    super(message ?? 'Item must be archived before this action.')
  }
}
