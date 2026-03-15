import { Entity } from '@/core/entities/entity.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'

export interface WorkspaceProps {
  userId: string
  name: string
  itemCount: number
  createdAt: Date
  updatedAt: Date
}

export class Workspace extends Entity<WorkspaceProps> {
  get name() {
    return this.props.name
  }

  get itemCount() {
    return this.props.itemCount
  }

  set name(value: string) {
    this.props.name = value
    this.touch()
  }

  get userId() {
    return this.props.userId
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
    props: Optional<WorkspaceProps, 'createdAt' | 'updatedAt' | 'itemCount'>,
    id?: UniqueEntityID,
  ) {
    return new Workspace(
      {
        ...props,
        itemCount: props.itemCount ?? 0,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )
  }
}
