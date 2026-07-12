import { AggregateRoot } from '@/core/entities/aggregate-root.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'
import { WorkspaceRenamedEvent } from '../events/workspace-renamed-event.ts'

export interface WorkspaceProps {
  userId: string
  name: string
  itemCount: number
  memberCount: number
  createdAt: Date
  updatedAt: Date
}

export class Workspace extends AggregateRoot<WorkspaceProps> {
  get name() {
    return this.props.name
  }

  get itemCount() {
    return this.props.itemCount
  }

  get memberCount() {
    return this.props.memberCount
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

  rename(name: string, actorId?: string) {
    if (name === this.props.name) return

    const before = this.props.name
    this.name = name

    this.addDomainEvent(
      new WorkspaceRenamedEvent(this, { before, after: name }, actorId),
    )
  }

  static create(
    props: Optional<WorkspaceProps, 'createdAt' | 'updatedAt' | 'itemCount' | 'memberCount'>,
    id?: UniqueEntityID,
  ) {
    return new Workspace(
      {
        ...props,
        itemCount: props.itemCount ?? 0,
        memberCount: props.memberCount ?? 0,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )
  }
}
