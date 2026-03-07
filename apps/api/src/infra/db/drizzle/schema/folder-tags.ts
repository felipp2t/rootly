import { foreignKey, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { folders } from './folders.ts'
import { tags } from './tags.ts'

export const folderTags = pgTable(
  'folder_tags',
  {
    folderId: text('folder_id').notNull(),
    tagId: text('tag_id').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.folderId, table.tagId] }),
    foreignKey({
      name: 'folder_tags_folder_id_fkey',
      columns: [table.folderId],
      foreignColumns: [folders.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'folder_tags_tag_id_fkey',
      columns: [table.tagId],
      foreignColumns: [tags.id],
    }).onDelete('cascade'),
  ],
)
