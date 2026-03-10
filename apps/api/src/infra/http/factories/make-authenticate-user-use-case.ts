import { AuthenticateUserUseCase } from '@/domain/root/application/use-cases/authenticate-user.ts'
import { JwtEncrypter } from '@/infra/auth/jwt-encrypter.ts'
import { ArgonHasher } from '@/infra/cryptography/argon-hasher.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleRefreshTokenRepository } from '@/infra/db/drizzle/repositories/drizzle-refresh-token-repository.ts'
import { DrizzleUserRepository } from '@/infra/db/drizzle/repositories/user-respository.ts'

export function makeAuthenticateUserUseCase() {
  const userRepository = new DrizzleUserRepository(db)
  const hasher = new ArgonHasher()
  const encrypter = new JwtEncrypter()
  const refreshTokenRepository = new DrizzleRefreshTokenRepository(db)
  const useCase = new AuthenticateUserUseCase(
    userRepository,
    hasher,
    encrypter,
    refreshTokenRepository,
  )
  return useCase
}
