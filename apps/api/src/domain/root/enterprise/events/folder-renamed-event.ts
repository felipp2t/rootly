import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { DomainEvent } from '@/core/events/domain-event.ts'
import type { Folder } from '../entities/folder.ts'

export interface FolderRenamedEventChanges {
  before: string
  after: string
}

export class FolderRenamedEvent implements DomainEvent {
  public ocurredAt: Date
  public folder: Folder
  public changes: FolderRenamedEventChanges
  public actorId?: string

  constructor(
    folder: Folder,
    changes: FolderRenamedEventChanges,
    actorId?: string,
  ) {
    this.folder = folder
    this.changes = changes
    this.actorId = actorId
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.folder.id
  }
}
