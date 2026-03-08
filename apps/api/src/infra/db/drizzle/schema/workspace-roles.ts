import {
  foreignKey,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import { nanoid } from '../helpers/nanoid.ts'
import { now } from '../helpers/now.ts'
import { workspaces } from './workspaces.ts'

export const workspaceRoles = pgTable(
  'workspace_roles',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    workspaceId: text('workspace_id').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(now),
  },
  (table) => [
    foreignKey({
      columns: [table.workspaceId],
      foreignColumns: [workspaces.id],
      name: 'workspace_roles_workspace_id_fkey',
    }).onDelete('cascade'),
    unique('workspace_roles_workspace_id_name_unique').on(
      table.workspaceId,
      table.name,
    ),
  ],
)
