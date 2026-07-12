import { Entity } from '@/core/entities/entity.ts'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'

export type ActivityResourceType =
  | 'folder'
  | 'item'
  | 'member'
  | 'workspace'
  | 'role'

export type ActivityAction =
  | 'folder_created'
  | 'folder_renamed'
  | 'folder_deleted'
  | 'item_created'
  | 'item_updated'
  | 'item_archived'
  | 'item_restored'
  | 'item_deleted'
  | 'member_invited'
  | 'member_joined'
  | 'member_role_changed'
  | 'member_removed'
  | 'workspace_renamed'
  | 'role_created'
  | 'role_deleted'
  | 'role_permissions_changed'

export interface ActivityLogMetadata {
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}

export interface ActivityLogProps {
  workspaceId: string
  resourceType: ActivityResourceType
  resourceId: string
  resourceName: string
  action: ActivityAction
  actorUserId: string
  actorName: string
  metadata?: ActivityLogMetadata
  createdAt: Date
}

export class ActivityLog extends Entity<ActivityLogProps> {
  get workspaceId() {
    return this.props.workspaceId
  }

  get resourceType() {
    return this.props.resourceType
  }

  get resourceId() {
    return this.props.resourceId
  }

  get resourceName() {
    return this.props.resourceName
  }

  get action() {
    return this.props.action
  }

  get actorUserId() {
    return this.props.actorUserId
  }

  get actorName() {
    return this.props.actorName
  }

  get metadata() {
    return this.props.metadata
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<ActivityLogProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new ActivityLog(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
