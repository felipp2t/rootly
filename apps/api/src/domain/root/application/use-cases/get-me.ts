import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { User } from '../../enterprise/entities/user.ts'
import type { UserRepository } from '../repositories/user-repository.ts'

interface GetMeUseCaseRequest {
  userId: string
}

type GetMeUseCaseResponse = Either<NotAllowedError, { user: User }>

export class GetMeUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    userId,
  }: GetMeUseCaseRequest): Promise<GetMeUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new NotAllowedError())
    }

    return right({ user })
  }
}
