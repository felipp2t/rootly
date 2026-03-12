import { type Either, right } from '@/core/types/either.ts'
import type { Workspace } from '../../enterprise/entities/workspace.ts'
import type { WorkspaceMemberRepository } from '../repositories/workspace-member-repository.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'

interface GetWorkspacesRequest {
  userId: string
}

type GetWorkspacesResponse = Either<void, { workspaces: Workspace[] }>

export class GetWorkspacesUseCase {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
  ) {}

  async execute({
    userId,
  }: GetWorkspacesRequest): Promise<GetWorkspacesResponse> {
    const workspacesMember =
      await this.workspaceMemberRepository.findByUserId(userId)

    if (workspacesMember.length === 0) {
      return right({
        workspaces: [],
      })
    }

    const workspaceIds = workspacesMember.map((m) => m.workspaceId.toString())
    const workspaces =
      await this.workspaceRepository.findManyByIds(workspaceIds)

    return right({ workspaces })
  }
}
