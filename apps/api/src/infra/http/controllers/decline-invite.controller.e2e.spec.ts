import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('POST /invites/:inviteId/decline', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.notifications)
    await db.delete(schema.refreshTokens)
    await db.delete(schema.workspaceInvites)
    await db.delete(schema.workspaceRoles)
    await db.delete(schema.workspaces)
    await db.delete(schema.users)
  })

  async function createUserAndAuthenticate() {
    const accountResponse = await app.inject({
      method: 'POST',
      url: '/api/accounts',
      payload: {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      },
    })

    const { userId } = accountResponse.json<{ userId: string }>()

    const sessionResponse = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { email: 'john@example.com', password: '123456' },
    })

    const setCookieHeader = sessionResponse.headers['set-cookie']
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader]
    const cookieHeader = cookies.map((c) => c?.split(';')[0]).join('; ')

    return { userId, cookieHeader }
  }

  it('should decline a pending invite and return 204', async () => {
    const { userId, cookieHeader } = await createUserAndAuthenticate()

    const [inviter] = await db
      .insert(schema.users)
      .values({ name: 'Owner', email: 'owner@example.com', passwordHash: 'h' })
      .returning()

    const [workspace] = await db
      .insert(schema.workspaces)
      .values({ name: 'Workspace', userId: inviter.id })
      .returning()

    const [role] = await db
      .insert(schema.workspaceRoles)
      .values({ workspaceId: workspace.id, name: 'Developer' })
      .returning()

    const [invite] = await db
      .insert(schema.workspaceInvites)
      .values({
        workspaceId: workspace.id,
        invitedUserId: userId,
        invitedByUserId: inviter.id,
        roleId: role.id,
        status: 'pending',
      })
      .returning()

    const response = await app.inject({
      method: 'POST',
      url: `/api/invites/${invite.id}/decline`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(204)
  })
})
