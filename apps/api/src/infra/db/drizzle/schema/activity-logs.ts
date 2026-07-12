import {
  foreignKey,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import type { ActivityLogMetadata } from '@/domain/activity/enterprise/entities/activity-log.ts'
import { nanoid } from '@/infra/db/drizzle/helpers/nanoid.ts'
import { workspaces } from './workspaces.ts'

export const activityResourceTypeEnum = pgEnum('activity_resource_type', [
  'folder',
  'item',
  'member',
  'workspace',
  'role',
])

export const activityActionEnum = pgEnum('activity_action', [
  'folder_created',
  'folder_renamed',
  'folder_deleted',
  'item_created',
  'item_updated',
  'item_archived',
  'item_restored',
  'item_deleted',
  'member_invited',
  'member_joined',
  'member_role_changed',
  'member_removed',
  'workspace_renamed',
  'role_created',
  'role_deleted',
  'role_permissions_changed',
])

export const activityLogs = pgTable(
  'activity_logs',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    workspaceId: text('workspace_id').notNull(),
    resourceType: activityResourceTypeEnum('resource_type').notNull(),
    resourceId: text('resource_id').notNull(),
    resourceName: text('resource_name').notNull(),
    action: activityActionEnum('action').notNull(),
    actorUserId: text('actor_user_id').notNull(),
    actorName: text('actor_name').notNull(),
    metadata: jsonb('metadata').$type<ActivityLogMetadata>(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      name: 'activity_logs_workspace_id_fkey',
      columns: [table.workspaceId],
      foreignColumns: [workspaces.id],
    }).onDelete('cascade'),
  ],
)
