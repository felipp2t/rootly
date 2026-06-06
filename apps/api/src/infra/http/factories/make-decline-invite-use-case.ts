import { DeclineInviteUseCase } from '@/domain/root/application/use-cases/decline-invite.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleWorkspaceInviteRepository } from '@/infra/db/drizzle/repositories/workspace-invite-repository.ts'

export function makeDeclineInviteUseCase() {
  const workspaceInviteRepository = new DrizzleWorkspaceInviteRepository(db)
  return new DeclineInviteUseCase(workspaceInviteRepository)
}
