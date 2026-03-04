import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { now } from '@/infra/db/drizzle/helpers/now.ts'
import { nanoid } from '@/infra/lib/nanoid.ts'

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(now),
})
