import { AggregateRoot } from '@/core/entities/aggregate-root.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'

export interface WorkspaceMemberProps {
  userId: string
  workspaceId: string
  roleId: string
  createdAt: Date
  updatedAt: Date
}

export class WorkspaceMember extends AggregateRoot<WorkspaceMemberProps> {
  get userId() {
    return this.props.userId
  }

  get workspaceId() {
    return this.props.workspaceId
  }

  get roleId() {
    return this.props.roleId
  }

  set roleId(value: string) {
    this.props.roleId = value
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
    props: Optional<WorkspaceMemberProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    return new WorkspaceMember(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )
  }
}
