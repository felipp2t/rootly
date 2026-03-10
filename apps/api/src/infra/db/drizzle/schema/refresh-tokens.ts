import { foreignKey, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { REFRESH_TOKEN_EXPIRATION_MS } from '@/domain/root/enterprise/entities/refresh-token.ts'
import { nanoid } from '../helpers/nanoid.ts'
import { users } from './users.ts'

function defaultRefreshTokenExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS)
}

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    token: text('token').notNull().unique(),
    userId: text('user_id').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true })
      .notNull()
      .$defaultFn(defaultRefreshTokenExpiresAt),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      name: 'refresh_tokens_user_id_fkey',
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
  ],
)
