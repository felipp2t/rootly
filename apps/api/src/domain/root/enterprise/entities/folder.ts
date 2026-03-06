import { Entity } from '@/core/entities/entity.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'

export interface FolderProps {
  name: string
  parentId?: string
  workspaceId: string
  createdAt: Date
  updatedAt: Date
}

export class Folder extends Entity<FolderProps> {
  get name() {
    return this.props.name
  }

  set name(value: string) {
    this.props.name = value
    this.touch()
  }

  get parentId() {
    return this.props.parentId
  }
  
  get workspaceId() {
    return this.props.workspaceId
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
    props: Optional<FolderProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    return new Folder(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )
  }
}
