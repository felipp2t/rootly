import { GetRolePermissionsUseCase } from '@/domain/root/application/use-cases/get-role-permissions.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleRolePermissionRepository } from '@/infra/db/drizzle/repositories/role-permission-repository.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'
import { DrizzleWorkspaceRoleRepository } from '@/infra/db/drizzle/repositories/workspace-role-repository.ts'

export function makeGetRolePermissionsUseCase() {
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  const workspaceRoleRepository = new DrizzleWorkspaceRoleRepository(db)
  const rolePermissionRepository = new DrizzleRolePermissionRepository(db)
  return new GetRolePermissionsUseCase(
    rolePermissionRepository,
    workspaceRoleRepository,
    workspaceRepository,
  )
}
