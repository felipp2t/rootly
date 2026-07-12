import type { BaseError } from '@/core/errors/base-error.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import { workspaceInviteStatus } from '../../enterprise/entities/workspace-invite.ts'
import type { RolePermissionRepository } from '../repositories/role-permission-repository.ts'
import type { WorkspaceInviteRepository } from '../repositories/workspace-invite-repository.ts'
import type { WorkspaceMemberRepository } from '../repositories/workspace-member-repository.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'
import { canManageInvites } from './_authorization/can-manage-invites.ts'

interface RevokeInviteUseCaseRequest {
  userId: string
  inviteId: string
}

type RevokeInviteUseCaseResponse = Either<BaseError, null>

export class RevokeInviteUseCase {
  constructor(
    private readonly workspaceInviteRepository: WorkspaceInviteRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  async execute({
    userId,
    inviteId,
  }: RevokeInviteUseCaseRequest): Promise<RevokeInviteUseCaseResponse> {
    const invite = await this.workspaceInviteRepository.findById(inviteId)

    if (!invite) {
      return left(new ResourceNotFoundError('Workspace invite'))
    }

    const workspace = await this.workspaceRepository.findById(
      userId,
      invite.workspaceId,
    )

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    const allowed = await canManageInvites(
      { userId, workspaceId: invite.workspaceId, ownerId: workspace.userId },
      this.workspaceMemberRepository,
      this.rolePermissionRepository,
    )

    if (!allowed) {
      return left(new NotAllowedError('Missing member:invite permission'))
    }

    if (invite.status !== workspaceInviteStatus.PENDING) {
      return left(new NotAllowedError('Only pending invites can be revoked'))
    }

    invite.revoke(userId)

    await this.workspaceInviteRepository.save(invite)

    return right(null)
  }
}
