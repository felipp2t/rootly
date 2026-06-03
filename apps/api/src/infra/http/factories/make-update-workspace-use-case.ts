import { UpdateWorkspaceUseCase } from '@/domain/root/application/use-cases/update-workspace.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'

export function makeUpdateWorkspaceUseCase() {
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  return new UpdateWorkspaceUseCase(workspaceRepository)
}
