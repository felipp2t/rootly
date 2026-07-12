import { Entity } from '@/core/entities/entity.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'
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

export class Item extends Entity<ItemProps> {
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

  archive() {
    this.props.archivedAt = new Date()
    this.touch()
  }

  restore() {
    this.props.archivedAt = undefined
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<ItemProps, 'createdAt' | 'updatedAt' | 'folderId'>,
    id?: UniqueEntityID,
  ) {
    validateTypeAndContent(props.type, props.content)

    return new Item(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )
  }
}
