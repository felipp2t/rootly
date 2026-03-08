import {
  foreignKey,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { nanoid } from '../helpers/nanoid.ts'
import { now } from '../helpers/now.ts'
import { workspaceRoles } from './workspace-roles.ts'

export const permissionResourceEnum = pgEnum('permission_resource', [
  'workspace',
  'folder',
  'item',
  'tag',
  'member',
  'role',
])

export const permissionActionEnum = pgEnum('permission_action', [
  'read',
  'create',
  'update',
  'delete',
  'invite',
])

export const rolePermissions = pgTable(
  'role_permissions',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    roleId: text('role_id').notNull(),
    resource: permissionResourceEnum('resource').notNull(),
    action: permissionActionEnum('action').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(now),
  },
  (table) => [
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [workspaceRoles.id],
      name: 'role_permissions_role_id_fkey',
    }).onDelete('cascade'),
  ],
)
