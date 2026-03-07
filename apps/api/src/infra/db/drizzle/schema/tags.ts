import { foreignKey, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { nanoid } from '../helpers/nanoid.ts'
import { now } from '../helpers/now.ts'
import { workspaces } from './workspaces.ts'

export const tagColorEnum = pgEnum('tag_color', [
  'blue',
  'green',
  'orange',
  'purple',
  'red',
  'yellow',
])

export const tags = pgTable(
  'tags',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    workspaceId: text('workspace_id').notNull(),
    name: text('name').notNull(),
    color: tagColorEnum('color').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(now),
  },
  (table) => [
    foreignKey({
      name: 'tags_workspace_id_fkey',
      columns: [table.workspaceId],
      foreignColumns: [workspaces.id],
    }).onDelete('cascade'),
  ],
)
