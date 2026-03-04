import type { BaseError } from '@/core/errors/base-error.ts'

export class InvalidItemTypeError extends Error implements BaseError {
  constructor(message?: string) {
    super(message ?? 'Invalid item type')
  }
}
