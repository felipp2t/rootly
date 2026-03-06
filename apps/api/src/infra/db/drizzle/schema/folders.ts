import { foreignKey, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { nanoid } from '@/infra/db/drizzle/helpers/nanoid.ts'
import { now } from '@/infra/db/drizzle/helpers/now.ts'

export const folders = pgTable(
  'folders',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: text('name').notNull(),
    parentId: text('parent_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(now),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'folders_parent_id_fkey',
    }).onDelete('restrict'),
  ],
)
