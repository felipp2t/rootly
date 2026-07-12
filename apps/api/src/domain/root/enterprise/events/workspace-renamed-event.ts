import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { DomainEvent } from '@/core/events/domain-event.ts'
import type { Workspace } from '../entities/workspace.ts'

export interface WorkspaceRenamedEventChanges {
  before: string
  after: string
}

export class WorkspaceRenamedEvent implements DomainEvent {
  public ocurredAt: Date
  public workspace: Workspace
  public changes: WorkspaceRenamedEventChanges
  public actorId?: string

  constructor(
    workspace: Workspace,
    changes: WorkspaceRenamedEventChanges,
    actorId?: string,
  ) {
    this.workspace = workspace
    this.changes = changes
    this.actorId = actorId
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.workspace.id
  }
}
