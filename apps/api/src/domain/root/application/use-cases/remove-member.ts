import type { BaseError } from '@/core/errors/base-error.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { WorkspaceMemberRepository } from '../repositories/workspace-member-repository.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'

interface RemoveMemberUseCaseRequest {
  userId: string
  workspaceId: string
  memberId: string
}

type RemoveMemberUseCaseResponse = Either<BaseError, null>

export class RemoveMemberUseCase {
  constructor(
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute({
    userId,
    workspaceId,
    memberId,
  }: RemoveMemberUseCaseRequest): Promise<RemoveMemberUseCaseResponse> {
    const workspace = await this.workspaceRepository.findById(
      userId,
      workspaceId,
    )

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    const member = await this.workspaceMemberRepository.findById(memberId)

    if (!member || member.workspaceId !== workspaceId) {
      return left(new ResourceNotFoundError('Member'))
    }

    if (member.userId === workspace.userId) {
      return left(new NotAllowedError('Cannot remove the workspace owner'))
    }

    member.remove(userId)

    await this.workspaceMemberRepository.delete(memberId)

    return right(null)
  }
}
