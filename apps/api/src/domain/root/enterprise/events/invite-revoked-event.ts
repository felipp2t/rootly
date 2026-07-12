import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { DomainEvent } from '@/core/events/domain-event.ts'
import type { WorkspaceInvite } from '../entities/workspace-invite.ts'

export class InviteRevokedEvent implements DomainEvent {
  public ocurredAt: Date
  public workspaceInvite: WorkspaceInvite
  public actorId?: string

  constructor(workspaceInvite: WorkspaceInvite, actorId?: string) {
    this.workspaceInvite = workspaceInvite
    this.actorId = actorId
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.workspaceInvite.id
  }
}
