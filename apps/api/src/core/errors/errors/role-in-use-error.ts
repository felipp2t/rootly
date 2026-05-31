import type { BaseError } from '../base-error.ts'

export class RoleInUseError extends Error implements BaseError {
  constructor(roleName: string) {
    super(
      `Role "${roleName}" cannot be deleted while members are assigned to it.`,
    )
  }
}
