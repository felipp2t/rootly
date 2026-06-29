import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { RefreshTokenRepository } from '../repositories/refresh-token-repository.ts'
import { InvalidRefreshTokenError } from './errors/invalid-refresh-token-error.ts'

interface LogoutUseCaseRequest {
  refreshToken: string
}

type LogoutUseCaseResponse = Either<BaseError, Record<string, never>>

export class LogoutUseCase {
  constructor(private refreshTokenRepository: RefreshTokenRepository) {}

  async execute({
    refreshToken,
  }: LogoutUseCaseRequest): Promise<LogoutUseCaseResponse> {
    const token = await this.refreshTokenRepository.findByToken(refreshToken)

    if (!token) {
      return left(new InvalidRefreshTokenError())
    }

    await this.refreshTokenRepository.delete(token.id.toString())

    return right({})
  }
}
