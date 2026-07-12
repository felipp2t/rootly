import { AggregateRoot } from '@/core/entities/aggregate-root.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'
import { MemberJoinedEvent } from '../events/member-joined-event.ts'
import { MemberRemovedEvent } from '../events/member-removed-event.ts'
import { MemberRoleChangedEvent } from '../events/member-role-changed-event.ts'

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

  changeRole(roleId: string, actorId?: string) {
    if (roleId === this.props.roleId) return

    const before = this.props.roleId
    this.roleId = roleId

    this.addDomainEvent(
      new MemberRoleChangedEvent(this, { before, after: roleId }, actorId),
    )
  }

  remove(actorId?: string) {
    this.addDomainEvent(new MemberRemovedEvent(this, actorId))
  }

  static create(
    props: Optional<WorkspaceMemberProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    const member = new WorkspaceMember(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    const isNew = !id

    if (isNew) {
      member.addDomainEvent(new MemberJoinedEvent(member))
    }

    return member
  }
}
