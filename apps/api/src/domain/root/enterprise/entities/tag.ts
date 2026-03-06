import { Entity } from '@/core/entities/entity.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'

type TagColor = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow'

export interface TagProps {
  name: string
  color: TagColor
  workspaceId: string
  createdAt: Date
  updatedAt: Date
}

export class Tag extends Entity<TagProps> {
  get name() {
    return this.props.name
  }

  set name(value: string) {
    this.props.name = value
    this.touch()
  }

  get color() {
    return this.props.color
  }

  set color(value: TagColor) {
    this.props.color = value
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
    props: Optional<TagProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    return new Tag(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )
  }
}
