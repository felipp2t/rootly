import { GetWorkspacesUseCase } from '@/domain/root/application/use-cases/get-workspaces.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleWorkspaceMemberRepository } from '@/infra/db/drizzle/repositories/workspace-member-repository.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'

export function makeGetWorkspacesUseCase() {
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  const workspaceMemberRepository = new DrizzleWorkspaceMemberRepository(db)
  return new GetWorkspacesUseCase(workspaceRepository, workspaceMemberRepository)
}
