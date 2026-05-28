import type { BaseError } from '@/core/errors/base-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { RolePermission } from '../../enterprise/entities/role-permission.ts'
import type { RolePermissionRepository } from '../repositories/role-permission-repository.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'
import type { WorkspaceRoleRepository } from '../repositories/workspace-role-repository.ts'

interface GetRolePermissionsUseCaseRequest {
  userId: string
  workspaceId: string
  roleId: string
}

type GetRolePermissionsUseCaseResponse = Either<
  BaseError,
  { permissions: RolePermission[] }
>

export class GetRolePermissionsUseCase {
  constructor(
    private readonly rolePermissionRepository: RolePermissionRepository,
    private readonly workspaceRoleRepository: WorkspaceRoleRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute({
    userId,
    workspaceId,
    roleId,
  }: GetRolePermissionsUseCaseRequest): Promise<GetRolePermissionsUseCaseResponse> {
    const workspace = await this.workspaceRepository.findById(userId, workspaceId)

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    const role = await this.workspaceRoleRepository.findById(roleId)

    if (!role || role.workspaceId !== workspaceId) {
      return left(new ResourceNotFoundError('Role'))
    }

    const permissions = await this.rolePermissionRepository.findByRoleId(roleId)

    return right({ permissions })
  }
}
