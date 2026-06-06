import { AcceptInviteUseCase } from '@/domain/root/application/use-cases/accept-invite.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleWorkspaceInviteRepository } from '@/infra/db/drizzle/repositories/workspace-invite-repository.ts'
import { DrizzleWorkspaceMemberRepository } from '@/infra/db/drizzle/repositories/workspace-member-repository.ts'

export function makeAcceptInviteUseCase() {
  const workspaceInviteRepository = new DrizzleWorkspaceInviteRepository(db)
  const workspaceMemberRepository = new DrizzleWorkspaceMemberRepository(db)
  return new AcceptInviteUseCase(
    workspaceInviteRepository,
    workspaceMemberRepository,
  )
}
