import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { DomainEvent } from '@/core/events/domain-event.ts'
import type { Item } from '../entities/item.ts'

export interface ItemUpdatedEventFields {
  title?: string
  content?: string
}

export interface ItemUpdatedEventChanges {
  before: ItemUpdatedEventFields
  after: ItemUpdatedEventFields
}

export class ItemUpdatedEvent implements DomainEvent {
  public ocurredAt: Date
  public item: Item
  public changes: ItemUpdatedEventChanges

  constructor(item: Item, changes: ItemUpdatedEventChanges) {
    this.item = item
    this.changes = changes
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.item.id
  }
}
