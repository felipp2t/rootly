import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { Encrypter } from '../cryptography/encrypter.ts'
import type { HashComparer } from '../cryptography/hash-comparer.ts'
import type { RefreshTokenRepository } from '../repositories/refresh-token-repository.ts'
import type { UserRepository } from '../repositories/user-repository.ts'
import { RefreshToken } from '../../enterprise/entities/refresh-token.ts'
import { WrongCredentialsError } from './errors/wrong-credencials-error.ts'

interface AuthenticateUserUseCaseRequest {
  email: string
  password: string
}

type AuthenticateUserUseCaseResponse = Either<
  BaseError,
  {
    accessToken: string
    refreshToken: string
  }
>

export class AuthenticateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      return left(new WrongCredentialsError())
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.passwordHash,
    )

    if (!isPasswordValid) {
      return left(new WrongCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
    })

    const refreshToken = RefreshToken.create({ userId: user.id.toString() })
    await this.refreshTokenRepository.create(refreshToken)

    return right({
      accessToken,
      refreshToken: refreshToken.token,
    })
  }
}
