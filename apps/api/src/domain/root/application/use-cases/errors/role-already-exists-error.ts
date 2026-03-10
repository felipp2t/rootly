import type { BaseError } from '@/core/errors/base-error.ts'

export class RoleAlreadyExistsError extends Error implements BaseError {
  constructor(name: string) {
    super(`Role "${name}" already exists in this workspace.`)
  }
}
