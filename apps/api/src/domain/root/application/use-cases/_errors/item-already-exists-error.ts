import type { BaseError } from '@/core/errors/base-error.ts'

export class ItemAlreadyExistsError extends Error implements BaseError {
  constructor() {
    super('Item with the same name already exists in the same parent folder')
  }
}
