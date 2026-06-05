import {
  foreignKey,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import type { NotificationMetadata } from '@/domain/notification/enterprise/entities/notification.ts'
import { nanoid } from '../helpers/nanoid.ts'
import { users } from './users.ts'

export const notifications = pgTable(
  'notifications',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    recipientId: text('recipient_id').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    metadata: jsonb('metadata').$type<NotificationMetadata>().notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      name: 'notifications_recipient_id_fkey',
      columns: [table.recipientId],
      foreignColumns: [users.id],
    }),
  ],
)
