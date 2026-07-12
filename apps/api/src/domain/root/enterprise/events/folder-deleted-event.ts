import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { DomainEvent } from '@/core/events/domain-event.ts'
import type { Folder } from '../entities/folder.ts'

export class FolderDeletedEvent implements DomainEvent {
  public ocurredAt: Date
  public folder: Folder

  constructor(folder: Folder) {
    this.folder = folder
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.folder.id
  }
}
