import { RevokeInviteUseCase } from '@/domain/root/application/use-cases/revoke-invite.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleRolePermissionRepository } from '@/infra/db/drizzle/repositories/role-permission-repository.ts'
import { DrizzleWorkspaceInviteRepository } from '@/infra/db/drizzle/repositories/workspace-invite-repository.ts'
import { DrizzleWorkspaceMemberRepository } from '@/infra/db/drizzle/repositories/workspace-member-repository.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'

export function makeRevokeInviteUseCase() {
  return new RevokeInviteUseCase(
    new DrizzleWorkspaceInviteRepository(db),
    new DrizzleWorkspaceRepository(db),
    new DrizzleWorkspaceMemberRepository(db),
    new DrizzleRolePermissionRepository(db),
  )
}
