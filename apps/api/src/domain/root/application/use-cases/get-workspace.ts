import type { BaseError } from '@/core/errors/base-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { Workspace } from '../../enterprise/entities/workspace.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'

interface GetWorkspaceRequest {
  userId: string
  workspaceId: string
}

type GetWorkspaceResponse = Either<BaseError, { workspace: Workspace }>

export class GetWorkspacesUseCase {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute({
    userId,
    workspaceId,
  }: GetWorkspaceRequest): Promise<GetWorkspaceResponse> {
    const workspace = await this.workspaceRepository.findById(
      userId,
      workspaceId,
    )

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    return right({ workspace })
  }
}
