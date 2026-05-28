import { GetRolesUseCase } from '@/domain/root/application/use-cases/get-roles.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'
import { DrizzleWorkspaceRoleRepository } from '@/infra/db/drizzle/repositories/workspace-role-repository.ts'

export function makeGetRolesUseCase() {
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  const workspaceRoleRepository = new DrizzleWorkspaceRoleRepository(db)
  return new GetRolesUseCase(workspaceRoleRepository, workspaceRepository)
}
