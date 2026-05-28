import { DeleteRoleUseCase } from '@/domain/root/application/use-cases/delete-role.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'
import { DrizzleWorkspaceRoleRepository } from '@/infra/db/drizzle/repositories/workspace-role-repository.ts'

export function makeDeleteRoleUseCase() {
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  const workspaceRoleRepository = new DrizzleWorkspaceRoleRepository(db)
  return new DeleteRoleUseCase(workspaceRoleRepository, workspaceRepository)
}
