import { CreateWorkspaceUseCase } from '@/domain/root/application/use-cases/create-workspace.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleRolePermissionRepository } from '@/infra/db/drizzle/repositories/role-permission-repository.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'
import { DrizzleWorkspaceRoleRepository } from '@/infra/db/drizzle/repositories/workspace-role-repository.ts'

export function makeCreateWorkspaceUseCase() {
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  const workspaceRoleRepository = new DrizzleWorkspaceRoleRepository(db)
  const rolePermissionRepository = new DrizzleRolePermissionRepository(db)
  const useCase = new CreateWorkspaceUseCase(
    workspaceRepository,
    workspaceRoleRepository,
    rolePermissionRepository,
  )
  return useCase
}
