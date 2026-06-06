import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('GET /workspaces/:workspaceId/invites', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.notifications)
    await db.delete(schema.refreshTokens)
    await db.delete(schema.workspaceInvites)
    await db.delete(schema.workspaceMembers)
    await db.delete(schema.workspaceRoles)
    await db.delete(schema.workspaces)
    await db.delete(schema.users)
  })

  async function createUserAndAuthenticate() {
    await app.inject({
      method: 'POST',
      url: '/api/accounts',
      payload: {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      },
    })

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

    return { cookieHeader }
  }

  async function createWorkspace(cookieHeader: string) {
    const workspaceResponse = await app.inject({
      method: 'POST',
      url: '/api/workspaces',
      headers: { cookie: cookieHeader },
      payload: { name: 'My Workspace' },
    })

    return workspaceResponse.json<{ workspaceId: string }>().workspaceId
  }

  it('should list pending invites and return 200', async () => {
    const { cookieHeader } = await createUserAndAuthenticate()
    const workspaceId = await createWorkspace(cookieHeader)

    const [role] = await db
      .insert(schema.workspaceRoles)
      .values({ workspaceId, name: 'Developer' })
      .returning()

    const [invitedUser] = await db
      .insert(schema.users)
      .values({ name: 'Jane', email: 'jane@example.com', passwordHash: 'h' })
      .returning()

    const inviteResponse = await app.inject({
      method: 'POST',
      url: `/api/workspaces/${workspaceId}/invites`,
      headers: { cookie: cookieHeader },
      payload: { email: invitedUser.email, roleId: role.id },
    })

    expect(inviteResponse.statusCode).toBe(201)

    const response = await app.inject({
      method: 'GET',
      url: `/api/workspaces/${workspaceId}/invites`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      invites: [
        {
          id: expect.any(String),
          email: 'jane@example.com',
          roleName: 'Developer',
          status: 'pending',
        },
      ],
    })
  })
})
