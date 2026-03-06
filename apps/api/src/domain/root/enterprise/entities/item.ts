import { Entity } from '@/core/entities/entity.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'
import { validateTypeAndContent } from '../validators/item-type-validator.ts'

export type ItemType = 'link' | 'document' | 'secret' | 'text'

export interface ItemProps {
  folderId: string
  type: ItemType
  title: string
  content?: string
  tagIds: string[]
  createdAt: Date
  updatedAt: Date
}

export class Item extends Entity<ItemProps> {
  get folderId() {
    return this.props.folderId
  }

  get type() {
    return this.props.type
  }

  get title() {
    return this.props.title
  }

  set title(value: string) {
    this.props.title = value
    this.touch()
  }

  get content() {
    return this.props.content
  }

  set content(value: string | undefined) {
    this.props.content = value
    this.touch()
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get tagIds() {
    return this.props.tagIds
  }

  set tagIds(value: string[]) {
    this.props.tagIds = value
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<ItemProps, 'createdAt' | 'updatedAt' | 'tagIds'>,
    id?: UniqueEntityID,
  ) {
    validateTypeAndContent(props.type, props.content)

    return new Item(
      {
        ...props,
        tagIds: props.tagIds ?? [],
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )
  }
}
