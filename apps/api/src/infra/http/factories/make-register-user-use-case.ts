import { RegisterUserUseCase } from '@/domain/root/application/use-cases/register-user.ts'
import { ArgonHasher } from '@/infra/cryptography/argon-hasher.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleUserRepository } from '@/infra/db/drizzle/repositories/user-respository.ts'

export function makeRegisterUserUseCase() {
  const userRepository = new DrizzleUserRepository(db)
  const hashRepository = new ArgonHasher()
  const useCase = new RegisterUserUseCase(userRepository, hashRepository)
  return useCase
}
