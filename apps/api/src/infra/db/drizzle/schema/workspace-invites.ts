import { foreignKey, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { nanoid } from '../helpers/nanoid.ts'
import { now } from '../helpers/now.ts'
import { users } from './users.ts'
import { workspaceRoles } from './workspace-roles.ts'
import { workspaces } from './workspaces.ts'

export const workspaceInvitesStatusEnum = pgEnum('workspace_invites_status', [
  'pending',
  'accepted',
  'declined',
  'revoked',
])

export const workspaceInvites = pgTable(
  'workspace_invites',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    workspaceId: text('user_id').notNull(),
    invitedUserId: text('invited_user_id').notNull(),
    invitedByUserId: text('invited_by_user_id').notNull(),
    roleId: text('role_id').notNull(),
    status: workspaceInvitesStatusEnum('pending').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(now),
  },
  (table) => [
    foreignKey({
      name: 'workspaces_invites_workspace_id_fkey',
      columns: [table.workspaceId],
      foreignColumns: [workspaces.id],
    }),
    foreignKey({
      name: 'workspaces_invites_invited_user_id_fkey',
      columns: [table.invitedUserId],
      foreignColumns: [users.id],
    }),
    foreignKey({
      name: 'workspaces_invites_invited_by_user_id_fkey',
      columns: [table.invitedByUserId],
      foreignColumns: [users.id],
    }),
    foreignKey({
      name: 'workspaces_invites_role_id_fkey',
      columns: [table.roleId],
      foreignColumns: [workspaceRoles.id],
    })
  ],
)
