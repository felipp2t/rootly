import { RegisterUserUseCase } from '@/domain/root/application/use-cases/register-user.ts'
import { ArgonHasher } from '@/infra/cryptography/argon-hasher.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleUserRepository } from '@/infra/db/drizzle/repositories/user-respository.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'

export function makeRegisterUserUseCase() {
  const userRepository = new DrizzleUserRepository(db)
  const hashRepository = new ArgonHasher()
  const workspaceRepository = new DrizzleWorkspaceRepository(db)
  const useCase = new RegisterUserUseCase(
    userRepository,
    workspaceRepository,
    hashRepository,
  )
  return useCase
}
