import type { BaseError } from '@/core/errors/base-error.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import { workspaceInviteStatus } from '../../enterprise/entities/workspace-invite.ts'
import type { WorkspaceInviteRepository } from '../repositories/workspace-invite-repository.ts'
import { WorkspaceInviteAlreadyAcceptedError } from './errors/workspace-invite-already-accepted-error.ts'
import { WorkspaceInviteExpiredError } from './errors/workspace-invite-expired-error.ts'

interface DeclineInviteUseCaseRequest {
  inviteId: string
  userId: string
}

type DeclineInviteUseCaseResponse = Either<BaseError, void>

export class DeclineInviteUseCase {
  constructor(
    private readonly workspaceInviteRepository: WorkspaceInviteRepository,
  ) {}

  async execute({
    inviteId,
    userId,
  }: DeclineInviteUseCaseRequest): Promise<DeclineInviteUseCaseResponse> {
    const workspaceInvite =
      await this.workspaceInviteRepository.findById(inviteId)

    if (!workspaceInvite) {
      return left(new ResourceNotFoundError('Workspace invite'))
    }

    if (workspaceInvite.status !== workspaceInviteStatus.PENDING) {
      return left(new WorkspaceInviteAlreadyAcceptedError(inviteId))
    }

    if (workspaceInvite.expiresAt < new Date()) {
      return left(new WorkspaceInviteExpiredError(inviteId))
    }

    if (workspaceInvite.invitedUserId !== userId) {
      return left(new NotAllowedError('User is not allowed to decline this invite'))
    }

    workspaceInvite.decline()

    await this.workspaceInviteRepository.save(workspaceInvite)

    return right(undefined)
  }
}
