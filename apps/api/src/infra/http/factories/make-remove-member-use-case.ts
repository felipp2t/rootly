import { RemoveMemberUseCase } from '@/domain/root/application/use-cases/remove-member.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleWorkspaceMemberRepository } from '@/infra/db/drizzle/repositories/workspace-member-repository.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'

export function makeRemoveMemberUseCase() {
  const workspaceMemberRepository = new DrizzleWorkspaceMemberRepository(db)
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  return new RemoveMemberUseCase(workspaceMemberRepository, workspaceRepository)
}
