import { foreignKey, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { nanoid } from '../helpers/nanoid.ts'
import { now } from '../helpers/now.ts'
import { users } from './users.ts'
import { workspaceRoles } from './workspace-roles.ts'
import { workspaces } from './workspaces.ts'

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    userId: text('user_id').notNull(),
    workspaceId: text('workspace_id').notNull(),
    roleId: text('role_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(now),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'workspace_members_user_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.workspaceId],
      foreignColumns: [workspaces.id],
      name: 'workspace_members_workspace_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [workspaceRoles.id],
      name: 'workspace_members_role_id_fkey',
    }).onDelete('restrict'),
  ],
)
