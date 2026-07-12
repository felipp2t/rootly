import { AggregateRoot } from '@/core/entities/aggregate-root.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'
import { ItemArchivedEvent } from '../events/item-archived-event.ts'
import { ItemCreatedEvent } from '../events/item-created-event.ts'
import { ItemDeletedEvent } from '../events/item-deleted-event.ts'
import { ItemRestoredEvent } from '../events/item-restored-event.ts'
import {
  ItemUpdatedEvent,
  type ItemUpdatedEventFields,
} from '../events/item-updated-event.ts'
import { ItemArchivedError } from '../validators/_errors/item-archived-error.ts'
import { validateTypeAndContent } from '../validators/item-type-validator.ts'

export type ItemType = 'link' | 'document' | 'secret' | 'text'

export interface ItemProps {
  folderId?: string
  workspaceId: string
  type: ItemType
  title: string
  content?: string
  archivedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export class Item extends AggregateRoot<ItemProps> {
  get folderId() {
    return this.props.folderId
  }

  get workspaceId() {
    return this.props.workspaceId
  }

  get type() {
    return this.props.type
  }

  get title() {
    return this.props.title
  }

  set title(value: string) {
    if (this.isArchived) throw new ItemArchivedError()
    this.props.title = value
    this.touch()
  }

  get content() {
    return this.props.content
  }

  set content(value: string | undefined) {
    if (this.isArchived) throw new ItemArchivedError()
    this.props.content = value
    this.touch()
  }

  get archivedAt() {
    return this.props.archivedAt
  }

  get isArchived() {
    return this.props.archivedAt !== undefined
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  archive(actorId?: string) {
    this.props.archivedAt = new Date()
    this.touch()
    this.addDomainEvent(new ItemArchivedEvent(this, actorId))
  }

  restore(actorId?: string) {
    this.props.archivedAt = undefined
    this.touch()
    this.addDomainEvent(new ItemRestoredEvent(this, actorId))
  }

  update(fields: ItemUpdatedEventFields, actorId?: string) {
    const before: ItemUpdatedEventFields = {}
    const after: ItemUpdatedEventFields = {}

    if (fields.title !== undefined && fields.title !== this.props.title) {
      before.title = this.props.title
      this.title = fields.title
      after.title = fields.title
    }

    if (fields.content !== undefined && fields.content !== this.props.content) {
      before.content = this.props.content
      this.content = fields.content
      after.content = fields.content
    }

    if (Object.keys(after).length === 0) return

    this.addDomainEvent(new ItemUpdatedEvent(this, { before, after }, actorId))
  }

  delete(actorId?: string) {
    this.addDomainEvent(new ItemDeletedEvent(this, actorId))
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<ItemProps, 'createdAt' | 'updatedAt' | 'folderId'>,
    id?: UniqueEntityID,
    actorId?: string,
  ) {
    validateTypeAndContent(props.type, props.content)

    const item = new Item(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    if (!id) {
      item.addDomainEvent(new ItemCreatedEvent(item, actorId))
    }

    return item
  }
}
