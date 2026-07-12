import type { BaseError } from '@/core/errors/base-error.ts'
import { InvalidPermissionError } from '@/core/errors/errors/invalid-permission-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import {
  isPermissionAllowed,
  normalizePermissions,
  type PermissionAction,
  type PermissionResource,
  RolePermission,
} from '../../enterprise/entities/role-permission.ts'
import type { RolePermissionRepository } from '../repositories/role-permission-repository.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'
import type { WorkspaceRoleRepository } from '../repositories/workspace-role-repository.ts'

interface SetRolePermissionsUseCaseRequest {
  userId: string
  workspaceId: string
  roleId: string
  permissions: { resource: PermissionResource; action: PermissionAction }[]
}

type SetRolePermissionsUseCaseResponse = Either<BaseError, null>

export class SetRolePermissionsUseCase {
  constructor(
    private readonly rolePermissionRepository: RolePermissionRepository,
    private readonly workspaceRoleRepository: WorkspaceRoleRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute({
    userId,
    workspaceId,
    roleId,
    permissions,
  }: SetRolePermissionsUseCaseRequest): Promise<SetRolePermissionsUseCaseResponse> {
    const workspace = await this.workspaceRepository.findById(
      userId,
      workspaceId,
    )

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    const role = await this.workspaceRoleRepository.findById(roleId)

    if (!role || role.workspaceId !== workspaceId) {
      return left(new ResourceNotFoundError('Role'))
    }

    for (const { resource, action } of permissions) {
      if (!isPermissionAllowed(resource, action)) {
        return left(new InvalidPermissionError(resource, action))
      }
    }

    const current = await this.rolePermissionRepository.findByRoleId(roleId)
    const currentPairs = current.map((p) => ({
      resource: p.resource,
      action: p.action,
    }))
    const normalized = normalizePermissions(currentPairs, permissions)

    await this.rolePermissionRepository.deleteByRoleId(roleId)

    for (const { resource, action } of normalized) {
      const permission = RolePermission.create({ roleId, resource, action })
      await this.rolePermissionRepository.create(permission)
    }

    if (!permissionSetsEqual(currentPairs, normalized)) {
      role.changePermissions(currentPairs, normalized, userId)
      await this.workspaceRoleRepository.save(role)
    }

    return right(null)
  }
}

function permissionSetsEqual(
  a: { resource: PermissionResource; action: PermissionAction }[],
  b: { resource: PermissionResource; action: PermissionAction }[],
): boolean {
  const toKey = (p: {
    resource: PermissionResource
    action: PermissionAction
  }) => `${p.resource}:${p.action}`
  const aKeys = new Set(a.map(toKey))
  const bKeys = new Set(b.map(toKey))

  return aKeys.size === bKeys.size && [...aKeys].every((key) => bKeys.has(key))
}
