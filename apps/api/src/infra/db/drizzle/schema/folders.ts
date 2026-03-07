import { foreignKey, json, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { nanoid } from '@/infra/db/drizzle/helpers/nanoid.ts'
import { now } from '@/infra/db/drizzle/helpers/now.ts'
import { workspaces } from './workspaces.ts'

export const folders = pgTable(
  'folders',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    workspaceId: text('workspace_id').notNull(),
    name: text('name').notNull(),
    parentId: text('parent_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(now),
  },
  (table) => [
    foreignKey({
      columns: [table.workspaceId],
      foreignColumns: [workspaces.id],
      name: 'folders_workspace_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'folders_parent_id_fkey',
    }).onDelete('restrict'),
  ],
)
