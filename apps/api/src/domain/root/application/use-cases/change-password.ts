import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { HashComparer } from '../cryptography/hash-comparer.ts'
import type { HashGenerator } from '../cryptography/hash-generator.ts'
import type { RefreshTokenRepository } from '../repositories/refresh-token-repository.ts'
import type { UserRepository } from '../repositories/user-repository.ts'
import { WrongCredentialsError } from './errors/wrong-credencials-error.ts'

interface ChangePasswordUseCaseRequest {
  userId: string
  currentPassword: string
  newPassword: string
}

type ChangePasswordUseCaseResponse = Either<BaseError, Record<string, never>>

export class ChangePasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private hashComparer: HashComparer,
    private hashGenerator: HashGenerator,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute({
    userId,
    currentPassword,
    newPassword,
  }: ChangePasswordUseCaseRequest): Promise<ChangePasswordUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new WrongCredentialsError())
    }

    const isPasswordValid = await this.hashComparer.compare(
      currentPassword,
      user.passwordHash,
    )

    if (!isPasswordValid) {
      return left(new WrongCredentialsError())
    }

    user.passwordHash = await this.hashGenerator.hash(newPassword)

    await this.userRepository.save(user)
    await this.refreshTokenRepository.deleteManyByUserId(userId)

    return right({})
  }
}
