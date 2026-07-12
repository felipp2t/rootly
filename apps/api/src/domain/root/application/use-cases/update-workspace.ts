import type { BaseError } from '@/core/errors/base-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'

interface UpdateWorkspaceUseCaseRequest {
  userId: string
  workspaceId: string
  name: string
}

type UpdateWorkspaceUseCaseResponse = Either<BaseError, null>

export class UpdateWorkspaceUseCase {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute({
    userId,
    workspaceId,
    name,
  }: UpdateWorkspaceUseCaseRequest): Promise<UpdateWorkspaceUseCaseResponse> {
    const workspace = await this.workspaceRepository.findById(
      userId,
      workspaceId,
    )

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    workspace.rename(name, userId)

    await this.workspaceRepository.save(workspace)

    return right(null)
  }
}
