import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { DomainEvent } from '@/core/events/domain-event.ts'
import type { WorkspaceRole } from '../entities/workspace-role.ts'

export class RoleCreatedEvent implements DomainEvent {
  public ocurredAt: Date
  public role: WorkspaceRole
  public actorId?: string

  constructor(role: WorkspaceRole, actorId?: string) {
    this.role = role
    this.actorId = actorId
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.role.id
  }
}
