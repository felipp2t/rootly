import { foreignKey, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { now } from '@/db/utils/now.ts'
import { nanoid } from '@/lib/nanoid.ts'

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
