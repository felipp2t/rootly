import type { BaseError } from '@/core/errors/base-error.ts'

export class WorkspaceInviteAlreadyAcceptedError
  extends Error
  implements BaseError
{
  constructor(identifier: string) {
    super(`Workspace invite "${identifier}" has already been accepted.`)
  }
}
