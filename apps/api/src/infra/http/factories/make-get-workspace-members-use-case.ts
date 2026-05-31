import { GetWorkspaceMembersUseCase } from '@/domain/root/application/use-cases/get-workspace-members.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleUserRepository } from '@/infra/db/drizzle/repositories/user-respository.ts'
import { DrizzleWorkspaceMemberRepository } from '@/infra/db/drizzle/repositories/workspace-member-repository.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'
import { DrizzleWorkspaceRoleRepository } from '@/infra/db/drizzle/repositories/workspace-role-repository.ts'

export function makeGetWorkspaceMembersUseCase() {
  const workspaceMemberRepository = new DrizzleWorkspaceMemberRepository(db)
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  const userRepository = new DrizzleUserRepository(db)
  const workspaceRoleRepository = new DrizzleWorkspaceRoleRepository(db)
  return new GetWorkspaceMembersUseCase(
    workspaceMemberRepository,
    workspaceRepository,
    userRepository,
    workspaceRoleRepository,
  )
}
