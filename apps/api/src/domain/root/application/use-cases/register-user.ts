import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import { User } from '../../enterprise/entities/user.ts'
import { Workspace } from '../../enterprise/entities/workspace.ts'
import type { HashGenerator } from '../cryptography/hash-generator.ts'
import type { UserRepository } from '../repositories/user-repository.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'
import { UserAlreadyExistsError } from './_errors/user-already-exists-error.ts'

interface RegisterUserUseCaseRequest {
  name: string
  email: string
  password: string
}

type RegisterUserUseCaseResponse = Either<
  BaseError,
  {
    userId: string
  }
>

export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private workspaceRepository: WorkspaceRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    email,
    password,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    const userWithSameEmail = await this.userRepository.findByEmail(email)

    if (userWithSameEmail) {
      return left(new UserAlreadyExistsError(email))
    }

    const hashedPassword = await this.hashGenerator.hash(password)

    const user = User.create({
      name,
      email,
      passwordHash: hashedPassword,
    })

    await this.userRepository.create(user)

    const workspace = Workspace.create({
      userId: user.id.toString(),
      name: 'My Workspace',
    })

    this.workspaceRepository.create(workspace)

    return right({
      userId: user.id.toString(),
    })
  }
}
