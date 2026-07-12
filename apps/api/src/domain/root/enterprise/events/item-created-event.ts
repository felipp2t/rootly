import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { DomainEvent } from '@/core/events/domain-event.ts'
import type { Item } from '../entities/item.ts'

export class ItemCreatedEvent implements DomainEvent {
  public ocurredAt: Date
  public item: Item

  constructor(item: Item) {
    this.item = item
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.item.id
  }
}
