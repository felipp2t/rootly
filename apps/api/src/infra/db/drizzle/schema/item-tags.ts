import { foreignKey, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { items } from './items.ts'
import { tags } from './tags.ts'

export const itemTags = pgTable(
  'item_tags',
  {
    itemId: text('item_id').notNull(),
    tagId: text('tag_id').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.itemId, table.tagId] }),
    foreignKey({
      name: 'item_tags_item_id_fkey',
      columns: [table.itemId],
      foreignColumns: [items.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'item_tags_tag_id_fkey',
      columns: [table.tagId],
      foreignColumns: [tags.id],
    }).onDelete('cascade'),
  ],
)
