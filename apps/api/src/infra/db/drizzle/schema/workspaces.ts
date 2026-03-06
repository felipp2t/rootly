import { foreignKey, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { nanoid } from '../helpers/nanoid.ts'
import { now } from '../helpers/now.ts'
import { users } from './users.ts'

export const workspaces = pgTable(
  'workspaces',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(now),
  },
  (table) => [
    foreignKey({
      name: 'workspaces_user_id_fkey',
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
  ],
)
