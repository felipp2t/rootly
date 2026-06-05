import type { BaseError } from '@/core/errors/base-error.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { HashComparer } from '../cryptography/hash-comparer.ts'
import type { UserRepository } from '../repositories/user-repository.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'
import { WrongCredentialsError } from './errors/wrong-credencials-error.ts'

interface DeleteWorkspaceUseCaseRequest {
  userId: string
  workspaceId: string
  password: string
}

type DeleteWorkspaceUseCaseResponse = Either<BaseError, null>

export class DeleteWorkspaceUseCase {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly userRepository: UserRepository,
    private readonly hashComparer: HashComparer,
  ) {}

  async execute({
    userId,
    workspaceId,
    password,
  }: DeleteWorkspaceUseCaseRequest): Promise<DeleteWorkspaceUseCaseResponse> {
    const workspace = await this.workspaceRepository.findById(
      userId,
      workspaceId,
    )

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    if (workspace.userId !== userId) {
      return left(new NotAllowedError('Only the workspace owner can delete it'))
    }

    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.passwordHash,
    )

    if (!isPasswordValid) {
      return left(new WrongCredentialsError())
    }

    await this.workspaceRepository.delete(workspaceId)

    return right(null)
  }
}
