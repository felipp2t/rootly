import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { DomainEvent } from '@/core/events/domain-event.ts'
import type { WorkspaceMember } from '../entities/workspace-member.ts'

export class MemberInvitedEvent implements DomainEvent {
  public ocurredAt: Date
  public workspaceMember: WorkspaceMember

  constructor(workspaceMember: WorkspaceMember) {
    this.workspaceMember = workspaceMember
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.workspaceMember.id
  }
}
