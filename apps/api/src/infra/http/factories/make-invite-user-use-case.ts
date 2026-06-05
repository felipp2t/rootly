import { InviteUserUseCase } from '@/domain/root/application/use-cases/invite-user.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleUserRepository } from '@/infra/db/drizzle/repositories/user-respository.ts'
import { DrizzleWorkspaceInviteRepository } from '@/infra/db/drizzle/repositories/workspace-invite-repository.ts'

export function makeInviteUserUseCase() {
  const userRepository = new DrizzleUserRepository(db)
  const workspaceInviteRepository = new DrizzleWorkspaceInviteRepository(db)
  return new InviteUserUseCase(userRepository, workspaceInviteRepository)
}
