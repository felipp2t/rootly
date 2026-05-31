import { GetMyWorkspacePermissionsUseCase } from '@/domain/root/application/use-cases/get-my-workspace-permissions.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleRolePermissionRepository } from '@/infra/db/drizzle/repositories/role-permission-repository.ts'
import { DrizzleWorkspaceMemberRepository } from '@/infra/db/drizzle/repositories/workspace-member-repository.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'

export function makeGetMyWorkspacePermissionsUseCase() {
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  const workspaceMemberRepository = new DrizzleWorkspaceMemberRepository(db)
  const rolePermissionRepository = new DrizzleRolePermissionRepository(db)
  return new GetMyWorkspacePermissionsUseCase(
    workspaceRepository,
    workspaceMemberRepository,
    rolePermissionRepository,
  )
}
