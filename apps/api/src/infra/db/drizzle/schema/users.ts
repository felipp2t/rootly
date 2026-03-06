import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { nanoid } from '@/infra/db/drizzle/helpers/nanoid.ts'
import { now } from '@/infra/db/drizzle/helpers/now.ts'

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .notNull()
    .$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(now),
})
