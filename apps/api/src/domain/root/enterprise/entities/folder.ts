import { AggregateRoot } from '@/core/entities/aggregate-root.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'
import { FolderCreatedEvent } from '../events/folder-created-event.ts'
import { FolderDeletedEvent } from '../events/folder-deleted-event.ts'
import { FolderRenamedEvent } from '../events/folder-renamed-event.ts'

export interface FolderProps {
  name: string
  parentId?: string
  workspaceId: string
  createdAt: Date
  updatedAt: Date
}

export class Folder extends AggregateRoot<FolderProps> {
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

  rename(name: string, actorId?: string) {
    if (name === this.props.name) return

    const before = this.props.name
    this.name = name

    this.addDomainEvent(
      new FolderRenamedEvent(this, { before, after: name }, actorId),
    )
  }

  delete(actorId?: string) {
    this.addDomainEvent(new FolderDeletedEvent(this, actorId))
  }

  static create(
    props: Optional<FolderProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
    actorId?: string,
  ) {
    const folder = new Folder(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    if (!id) {
      folder.addDomainEvent(new FolderCreatedEvent(folder, actorId))
    }

    return folder
  }
}
