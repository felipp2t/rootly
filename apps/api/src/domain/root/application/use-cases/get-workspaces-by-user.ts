import { type Either, right } from '@/core/types/either.ts'
import type { Workspace } from '../../enterprise/entities/workspace.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'

interface GetWorkspacesRequest {
  userId: string
}
type GetWorkspacesResponse = Either<undefined, { workspaces: Workspace[] }>

export class GetWorkspacesUseCase {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute({
    userId,
  }: GetWorkspacesRequest): Promise<GetWorkspacesResponse> {
    const workspaces = await this.workspaceRepository.findManyByUserId(userId)

    return right({
      workspaces,
    })
  }
}
