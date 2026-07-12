import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { DomainEvent } from '@/core/events/domain-event.ts'
import type { Item } from '../entities/item.ts'

export class ItemArchivedEvent implements DomainEvent {
  public ocurredAt: Date
  public item: Item
  public actorId?: string

  constructor(item: Item, actorId?: string) {
    this.item = item
    this.actorId = actorId
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.item.id
  }
}
