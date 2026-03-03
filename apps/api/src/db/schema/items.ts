import {
  foreignKey,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { nanoid } from '@/lib/nanoid.ts'
import { folders } from './folders.ts'

export const itemTypeEnum = pgEnum('item_type', [
  'link',
  'document',
  'secret',
  'text',
])

export const items = pgTable(
  'items',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    folderId: text('folder_id').notNull(),
    type: itemTypeEnum('type').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      name: 'items_folder_id_fkey',
      columns: [table.folderId],
      foreignColumns: [folders.id],
    }),
  ],
)
