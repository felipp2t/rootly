import type { BaseError } from '@/core/errors/base-error.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import {
  type WorkspaceInviteStatus,
  workspaceInviteStatus,
} from '../../enterprise/entities/workspace-invite.ts'
import type { RolePermissionRepository } from '../repositories/role-permission-repository.ts'
import type { UserRepository } from '../repositories/user-repository.ts'
import type { WorkspaceInviteRepository } from '../repositories/workspace-invite-repository.ts'
import type { WorkspaceMemberRepository } from '../repositories/workspace-member-repository.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'
import type { WorkspaceRoleRepository } from '../repositories/workspace-role-repository.ts'
import { canManageInvites } from './_authorization/can-manage-invites.ts'

interface GetWorkspaceInvitesUseCaseRequest {
  userId: string
  workspaceId: string
}

interface WorkspaceInviteView {
  id: string
  email: string
  name: string
  roleId: string
  roleName: string
  status: WorkspaceInviteStatus
  createdAt: Date
  expiresAt: Date
}

type GetWorkspaceInvitesUseCaseResponse = Either<
  BaseError,
  { invites: WorkspaceInviteView[] }
>

export class GetWorkspaceInvitesUseCase {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
    private readonly workspaceInviteRepository: WorkspaceInviteRepository,
    private readonly userRepository: UserRepository,
    private readonly workspaceRoleRepository: WorkspaceRoleRepository,
  ) {}

  async execute({
    userId,
    workspaceId,
  }: GetWorkspaceInvitesUseCaseRequest): Promise<GetWorkspaceInvitesUseCaseResponse> {
    const workspace = await this.workspaceRepository.findById(
      userId,
      workspaceId,
    )

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    const allowed = await canManageInvites(
      { userId, workspaceId, ownerId: workspace.userId },
      this.workspaceMemberRepository,
      this.rolePermissionRepository,
    )

    if (!allowed) {
      return left(new NotAllowedError('Missing member:invite permission'))
    }

    const invites = await this.workspaceInviteRepository.findManyByWorkspaceId(
      workspaceId,
      [workspaceInviteStatus.PENDING],
    )

    const views = await Promise.all(
      invites.map(async (invite) => {
        const [user, role] = await Promise.all([
          this.userRepository.findById(invite.invitedUserId),
          this.workspaceRoleRepository.findById(invite.roleId),
        ])

        if (!user || !role) return null

        return {
          id: invite.id.toString(),
          email: user.email,
          name: user.name,
          roleId: invite.roleId,
          roleName: role.name,
          status: invite.status,
          createdAt: invite.createdAt,
          expiresAt: invite.expiresAt,
        } satisfies WorkspaceInviteView
      }),
    )

    return right({
      invites: views.filter(
        (view): view is WorkspaceInviteView => view !== null,
      ),
    })
  }
}
