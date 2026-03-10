import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { DomainEvent } from '@/core/events/domain-event.ts'
import type { WorkspaceInvite } from '../entities/workspace-invite.ts'

export class UserInvitedEvent implements DomainEvent {
  public ocurredAt: Date
  public workspaceInvite: WorkspaceInvite

  constructor(workspaceInvite: WorkspaceInvite) {
    this.workspaceInvite = workspaceInvite
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.workspaceInvite.id
  }
}
