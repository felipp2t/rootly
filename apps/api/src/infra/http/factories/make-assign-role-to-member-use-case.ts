import { AssignRoleToMemberUseCase } from '@/domain/root/application/use-cases/assign-role-to-member.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleWorkspaceMemberRepository } from '@/infra/db/drizzle/repositories/workspace-member-repository.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'
import { DrizzleWorkspaceRoleRepository } from '@/infra/db/drizzle/repositories/workspace-role-repository.ts'

export function makeAssignRoleToMemberUseCase() {
  const workspaceMemberRepository = new DrizzleWorkspaceMemberRepository(db)
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  const workspaceRoleRepository = new DrizzleWorkspaceRoleRepository(db)
  return new AssignRoleToMemberUseCase(
    workspaceMemberRepository,
    workspaceRepository,
    workspaceRoleRepository,
  )
}
