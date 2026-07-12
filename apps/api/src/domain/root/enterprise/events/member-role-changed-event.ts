import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { DomainEvent } from '@/core/events/domain-event.ts'
import type { WorkspaceMember } from '../entities/workspace-member.ts'

export interface MemberRoleChangedEventChanges {
  before: string
  after: string
}

export class MemberRoleChangedEvent implements DomainEvent {
  public ocurredAt: Date
  public workspaceMember: WorkspaceMember
  public changes: MemberRoleChangedEventChanges
  public actorId?: string

  constructor(
    workspaceMember: WorkspaceMember,
    changes: MemberRoleChangedEventChanges,
    actorId?: string,
  ) {
    this.workspaceMember = workspaceMember
    this.changes = changes
    this.actorId = actorId
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.workspaceMember.id
  }
}
