import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { DomainEvent } from '@/core/events/domain-event.ts'
import type { WorkspaceMember } from '../entities/workspace-member.ts'

export class MemberRemovedEvent implements DomainEvent {
  public ocurredAt: Date
  public workspaceMember: WorkspaceMember
  public actorId?: string

  constructor(workspaceMember: WorkspaceMember, actorId?: string) {
    this.workspaceMember = workspaceMember
    this.actorId = actorId
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.workspaceMember.id
  }
}
