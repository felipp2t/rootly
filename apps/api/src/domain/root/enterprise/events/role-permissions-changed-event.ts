import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { DomainEvent } from '@/core/events/domain-event.ts'
import type {
  PermissionAction,
  PermissionResource,
} from '../entities/role-permission.ts'
import type { WorkspaceRole } from '../entities/workspace-role.ts'

export interface RolePermissionsChangedEventChanges {
  before: { resource: PermissionResource; action: PermissionAction }[]
  after: { resource: PermissionResource; action: PermissionAction }[]
}

export class RolePermissionsChangedEvent implements DomainEvent {
  public ocurredAt: Date
  public role: WorkspaceRole
  public changes: RolePermissionsChangedEventChanges
  public actorId?: string

  constructor(
    role: WorkspaceRole,
    changes: RolePermissionsChangedEventChanges,
    actorId?: string,
  ) {
    this.role = role
    this.changes = changes
    this.actorId = actorId
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.role.id
  }
}
