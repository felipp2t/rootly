import { RefreshAccessTokenUseCase } from '@/domain/root/application/use-cases/refresh-access-token.ts'
import { JwtEncrypter } from '@/infra/auth/jwt-encrypter.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleRefreshTokenRepository } from '@/infra/db/drizzle/repositories/drizzle-refresh-token-repository.ts'

export function makeRefreshAccessTokenUseCase() {
  const refreshTokenRepository = new DrizzleRefreshTokenRepository(db)
  const encrypter = new JwtEncrypter()
  const useCase = new RefreshAccessTokenUseCase(refreshTokenRepository, encrypter)
  return useCase
}
