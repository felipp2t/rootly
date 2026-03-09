import { Entity } from '@/core/entities/entity.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'

export const permissionResource = [
  'workspace',
  'folder',
  'item',
  'tag',
  'member',
  'role',
] as const

export type PermissionResource = (typeof permissionResource)[number]

export const permissionAction = [
  'create',
  'read',
  'update',
  'delete',
  'invite',
  'all',
] as const

export type PermissionAction = (typeof permissionAction)[number]

export interface RolePermissionProps {
  roleId: string
  resource: PermissionResource
  action: PermissionAction
  createdAt: Date
  updatedAt: Date
}

export class RolePermission extends Entity<RolePermissionProps> {
  get roleId() {
    return this.props.roleId
  }

  get resource() {
    return this.props.resource
  }

  get action() {
    return this.props.action
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(
    props: Optional<RolePermissionProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    return new RolePermission(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )
  }
}
