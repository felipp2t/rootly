import { Entity } from '@/core/entities/entity.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'

interface ItemProps {
  folderId: string
  type: 'link' | 'document' | 'secret' | 'text'
  title: string
  content?: string
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

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<ItemProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
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
