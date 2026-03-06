import type { BaseError } from '@/core/errors/base-error.ts'

export class ItemNotFoundError extends Error implements BaseError {
  constructor() {
    super('Item not found.')
  }
}
