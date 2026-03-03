import {
  foreignKey,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { nanoid } from '@/infra/lib/nanoid.ts'
import { now } from '../helpers/now.ts'
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
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(now),
  },
  (table) => [
    foreignKey({
      name: 'items_folder_id_fkey',
      columns: [table.folderId],
      foreignColumns: [folders.id],
    }),
  ],
)
