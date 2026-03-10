import type { BaseError } from '@/core/errors/base-error.ts'

export class WorkspaceInviteExpiredError extends Error implements BaseError {
  constructor(inviteId: string) {
    super(`Workspace invite "${inviteId}" has expired.`)
  }
}
