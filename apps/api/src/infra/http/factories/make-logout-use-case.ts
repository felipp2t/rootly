import { LogoutUseCase } from '@/domain/root/application/use-cases/logout.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleRefreshTokenRepository } from '@/infra/db/drizzle/repositories/drizzle-refresh-token-repository.ts'

export function makeLogoutUseCase() {
  const refreshTokenRepository = new DrizzleRefreshTokenRepository(db)
  return new LogoutUseCase(refreshTokenRepository)
}
