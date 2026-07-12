import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { DomainEvent } from '@/core/events/domain-event.ts'
import type { Folder } from '../entities/folder.ts'

export class FolderCreatedEvent implements DomainEvent {
  public ocurredAt: Date
  public folder: Folder
  public actorId?: string

  constructor(folder: Folder, actorId?: string) {
    this.folder = folder
    this.actorId = actorId
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.folder.id
  }
}
