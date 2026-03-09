import { Entity } from '@/core/entities/entity.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'

export type WorkspaceInviteStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'revoked'

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

export class WorkspaceInvite extends Entity<WorkspaceInviteProps> {
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
    props: Optional<WorkspaceInviteProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    return new WorkspaceInvite(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )
  }
}
