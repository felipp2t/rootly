import type { BaseError } from '@/core/errors/base-error.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { InvalidProfileNameError } from './errors/invalid-profile-name-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { UserRepository } from '../repositories/user-repository.ts'

interface UpdateProfileUseCaseRequest {
  userId: string
  name: string
}

type UpdateProfileUseCaseResponse = Either<BaseError, Record<string, never>>

export class UpdateProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
    name,
  }: UpdateProfileUseCaseRequest): Promise<UpdateProfileUseCaseResponse> {
    if (name.trim().length < 3) {
      return left(new InvalidProfileNameError())
    }

    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new NotAllowedError())
    }

    user.name = name

    await this.userRepository.save(user)

    return right({})
  }
}
