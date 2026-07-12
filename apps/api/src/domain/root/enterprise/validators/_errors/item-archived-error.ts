import type { BaseError } from '@/core/errors/base-error.ts'

export class ItemArchivedError extends Error implements BaseError {
  constructor(message?: string) {
    super(message ?? 'Cannot modify an archived item')
  }
}
