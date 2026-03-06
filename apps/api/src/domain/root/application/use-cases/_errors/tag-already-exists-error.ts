import type { BaseError } from '@/core/errors/base-error.ts'

export class TagAlreadyExistsError extends Error implements BaseError {
  constructor() {
    super('Tag with the same name already exists in the same workspace.')
  }
}
