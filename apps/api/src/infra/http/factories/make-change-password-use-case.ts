import { ChangePasswordUseCase } from '@/domain/root/application/use-cases/change-password.ts'
import { ArgonHasher } from '@/infra/cryptography/argon-hasher.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleRefreshTokenRepository } from '@/infra/db/drizzle/repositories/drizzle-refresh-token-repository.ts'
import { DrizzleUserRepository } from '@/infra/db/drizzle/repositories/user-respository.ts'

export function makeChangePasswordUseCase() {
  const userRepository = new DrizzleUserRepository(db)
  const hasher = new ArgonHasher()
  const refreshTokenRepository = new DrizzleRefreshTokenRepository(db)
  const useCase = new ChangePasswordUseCase(
    userRepository,
    hasher,
    hasher,
    refreshTokenRepository,
  )
  return useCase
}
