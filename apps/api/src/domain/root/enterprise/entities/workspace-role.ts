import { Entity } from '@/core/entities/entity.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'

export interface WorkspaceRoleProps {
  workspaceId: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export class WorkspaceRole extends Entity<WorkspaceRoleProps> {
  get workspaceId() {
    return this.props.workspaceId
  }

  get name() {
    return this.props.name
  }

  set name(value: string) {
    this.props.name = value
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
    props: Optional<WorkspaceRoleProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    return new WorkspaceRole(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )
  }
}
