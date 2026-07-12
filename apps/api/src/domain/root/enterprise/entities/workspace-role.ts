import { AggregateRoot } from '@/core/entities/aggregate-root.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'
import { RoleCreatedEvent } from '../events/role-created-event.ts'
import { RoleDeletedEvent } from '../events/role-deleted-event.ts'
import { RolePermissionsChangedEvent } from '../events/role-permissions-changed-event.ts'
import type { PermissionAction, PermissionResource } from './role-permission.ts'

export interface WorkspaceRoleProps {
  workspaceId: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export type PermissionPair = {
  resource: PermissionResource
  action: PermissionAction
}

export class WorkspaceRole extends AggregateRoot<WorkspaceRoleProps> {
  get workspaceId() {
    return this.props.workspaceId
  }

  get name() {
    return this.props.name
  }

  set name(value: string) {
    this.props.name = value
    this.touch()
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  delete(actorId?: string) {
    this.addDomainEvent(new RoleDeletedEvent(this, actorId))
  }

  changePermissions(
    before: PermissionPair[],
    after: PermissionPair[],
    actorId?: string,
  ) {
    this.addDomainEvent(
      new RolePermissionsChangedEvent(this, { before, after }, actorId),
    )
  }

  static create(
    props: Optional<WorkspaceRoleProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
    actorId?: string,
  ) {
    const role = new WorkspaceRole(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    if (!id) {
      role.addDomainEvent(new RoleCreatedEvent(role, actorId))
    }

    return role
  }
}
