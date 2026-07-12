import type { BaseError } from '@/core/errors/base-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type {
  PermissionAction,
  PermissionResource,
} from '../../enterprise/entities/role-permission.ts'
import type { RolePermissionRepository } from '../repositories/role-permission-repository.ts'
import type { WorkspaceMemberRepository } from '../repositories/workspace-member-repository.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'

interface GetMyWorkspacePermissionsUseCaseRequest {
  userId: string
  workspaceId: string
}

type GetMyWorkspacePermissionsUseCaseResponse = Either<
  BaseError,
  { permissions: { resource: PermissionResource; action: PermissionAction }[] }
>

export class GetMyWorkspacePermissionsUseCase {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  async execute({
    userId,
    workspaceId,
  }: GetMyWorkspacePermissionsUseCaseRequest): Promise<GetMyWorkspacePermissionsUseCaseResponse> {
    const workspace = await this.workspaceRepository.findById(
      userId,
      workspaceId,
    )

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    const member =
      await this.workspaceMemberRepository.findByUserIdAndWorkspaceId(
        userId,
        workspaceId,
      )

    if (!member) {
      return right({ permissions: [] })
    }

    const rolePermissions = await this.rolePermissionRepository.findByRoleId(
      member.roleId,
    )

    return right({
      permissions: rolePermissions.map((p) => ({
        resource: p.resource,
        action: p.action,
      })),
    })
  }
}
