import { DeleteWorkspaceUseCase } from '@/domain/root/application/use-cases/delete-workspace.ts'
import { ArgonHasher } from '@/infra/cryptography/argon-hasher.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleUserRepository } from '@/infra/db/drizzle/repositories/user-respository.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'

export function makeDeleteWorkspaceUseCase() {
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  const userRepository = new DrizzleUserRepository(db)
  const hashComparer = new ArgonHasher()
  return new DeleteWorkspaceUseCase(
    workspaceRepository,
    userRepository,
    hashComparer,
  )
}
