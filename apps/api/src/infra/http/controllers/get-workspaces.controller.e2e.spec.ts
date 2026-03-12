import { eq } from 'drizzle-orm'
import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('GET /workspaces', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.refreshTokens)
    await db.delete(schema.items)
    await db.delete(schema.folders)
    await db.delete(schema.workspaceMembers)
    await db.delete(schema.workspaceInvites)
    await db.delete(schema.rolePermissions)
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

  async function createWorkspaceAndAddMember(userId: string) {
    const workspaceResponse = await app.inject({
      method: 'POST',
      url: '/api/workspaces',
      payload: { name: 'My Workspace', userId },
    })

    const { workspaceId } = workspaceResponse.json<{ workspaceId: string }>()

    const [role] = await db
      .select()
      .from(schema.workspaceRoles)
      .where(eq(schema.workspaceRoles.workspaceId, workspaceId))

    await db.insert(schema.workspaceMembers).values({
      userId,
      workspaceId,
      roleId: role.id,
    })

    return workspaceId
  }

  it('should return 200 with workspaces the authenticated user is a member of', async () => {
    const { userId, cookieHeader } = await createUserAndAuthenticate()
    await createWorkspaceAndAddMember(userId)

    const response = await app.inject({
      method: 'GET',
      url: '/api/workspaces',
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().workspaces).toHaveLength(1)
    expect(response.json().workspaces[0]).toMatchObject({
      id: expect.any(String),
      name: 'My Workspace',
      userId,
    })
  })

  it('should return 200 with an empty list when the user has no workspace memberships', async () => {
    const { cookieHeader } = await createUserAndAuthenticate()

    const response = await app.inject({
      method: 'GET',
      url: '/api/workspaces',
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().workspaces).toHaveLength(0)
  })

  it('should return 401 when no access token cookie is present', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/workspaces',
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toMatchObject({ message: 'Unauthorized' })
  })
})
