import { GetWorkspaceInvitesUseCase } from '@/domain/root/application/use-cases/get-workspace-invites.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleRolePermissionRepository } from '@/infra/db/drizzle/repositories/role-permission-repository.ts'
import { DrizzleUserRepository } from '@/infra/db/drizzle/repositories/user-respository.ts'
import { DrizzleWorkspaceInviteRepository } from '@/infra/db/drizzle/repositories/workspace-invite-repository.ts'
import { DrizzleWorkspaceMemberRepository } from '@/infra/db/drizzle/repositories/workspace-member-repository.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'
import { DrizzleWorkspaceRoleRepository } from '@/infra/db/drizzle/repositories/workspace-role-repository.ts'

export function makeGetWorkspaceInvitesUseCase() {
  return new GetWorkspaceInvitesUseCase(
    new DrizzleWorkspaceRepository(db),
    new DrizzleWorkspaceMemberRepository(db),
    new DrizzleRolePermissionRepository(db),
    new DrizzleWorkspaceInviteRepository(db),
    new DrizzleUserRepository(db),
    new DrizzleWorkspaceRoleRepository(db),
  )
}
