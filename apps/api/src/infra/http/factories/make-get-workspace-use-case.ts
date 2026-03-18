import { GetWorkspaceUseCase } from '@/domain/root/application/use-cases/get-workspace.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'

export function makeGetWorkspaceUseCase() {
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  return new GetWorkspaceUseCase(workspaceRepository)
}
