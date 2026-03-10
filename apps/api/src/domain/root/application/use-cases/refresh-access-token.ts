import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import { RefreshToken } from '../../enterprise/entities/refresh-token.ts'
import type { Encrypter } from '../cryptography/encrypter.ts'
import type { RefreshTokenRepository } from '../repositories/refresh-token-repository.ts'
import { InvalidRefreshTokenError } from './errors/invalid-refresh-token-error.ts'

interface RefreshAccessTokenUseCaseRequest {
  token: string
}

type RefreshAccessTokenUseCaseResponse = Either<
  BaseError,
  {
    accessToken: string
    refreshToken: string
  }
>

export class RefreshAccessTokenUseCase {
  constructor(
    private refreshTokenRepository: RefreshTokenRepository,
    private encrypter: Encrypter,
  ) {}

  async execute({
    token,
  }: RefreshAccessTokenUseCaseRequest): Promise<RefreshAccessTokenUseCaseResponse> {
    const refreshToken = await this.refreshTokenRepository.findByToken(token)

    if (!refreshToken) {
      return left(new InvalidRefreshTokenError())
    }

    if (refreshToken.isExpired) {
      await this.refreshTokenRepository.delete(refreshToken.id.toString())
      return left(new InvalidRefreshTokenError())
    }

    await this.refreshTokenRepository.delete(refreshToken.id.toString())

    const newRefreshToken = RefreshToken.create({ userId: refreshToken.userId })
    await this.refreshTokenRepository.create(newRefreshToken)

    const accessToken = await this.encrypter.encrypt({
      sub: refreshToken.userId,
    })

    return right({
      accessToken,
      refreshToken: newRefreshToken.token,
    })
  }
}
