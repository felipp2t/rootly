import { DeleteWorkspaceUseCase } from '@/domain/root/application/use-cases/delete-workspace.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'

export function makeDeleteWorkspaceUseCase() {
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  return new DeleteWorkspaceUseCase(workspaceRepository)
}
