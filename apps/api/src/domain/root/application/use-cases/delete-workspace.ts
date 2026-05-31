import type { BaseError } from '@/core/errors/base-error.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'

interface DeleteWorkspaceUseCaseRequest {
  userId: string
  workspaceId: string
}

type DeleteWorkspaceUseCaseResponse = Either<BaseError, null>

export class DeleteWorkspaceUseCase {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute({
    userId,
    workspaceId,
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

    await this.workspaceRepository.delete(workspaceId)

    return right(null)
  }
}
