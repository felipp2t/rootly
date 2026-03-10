export const INVITE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000

import { AggregateRoot } from '@/core/entities/aggregate-root.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'
import { UserInvitedEvent } from '../events/user-invited-event.ts'

export const workspaceInviteStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  REVOKED: 'revoked',
} as const

export type WorkspaceInviteStatus =
  (typeof workspaceInviteStatus)[keyof typeof workspaceInviteStatus]

export interface WorkspaceInviteProps {
  workspaceId: string
  invitedUserId: string
  invitedByUserId: string
  roleId: string
  status: WorkspaceInviteStatus
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export class WorkspaceInvite extends AggregateRoot<WorkspaceInviteProps> {
  get workspaceId() {
    return this.props.workspaceId
  }

  get invitedUserId() {
    return this.props.invitedUserId
  }

  get invitedByUserId() {
    return this.props.invitedByUserId
  }

  get roleId() {
    return this.props.roleId
  }

  get status() {
    return this.props.status
  }

  set status(value: WorkspaceInviteStatus) {
    this.props.status = value
    this.touch()
  }

  get expiresAt() {
    return this.props.expiresAt
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

  accept() {
    this.props.status = workspaceInviteStatus.ACCEPTED
    this.touch()
  }

  static create(
    props: Optional<
      WorkspaceInviteProps,
      'createdAt' | 'updatedAt' | 'status' | 'expiresAt'
    >,
    id?: UniqueEntityID,
  ) {
    const invite = new WorkspaceInvite(
      {
        ...props,
        status: props.status ?? workspaceInviteStatus.PENDING,
        expiresAt:
          props.expiresAt ?? new Date(Date.now() + INVITE_EXPIRATION_MS),
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    const isNew = !id

    if (isNew) {
      invite.addDomainEvent(new UserInvitedEvent(invite))
    }

    return invite
  }
}
