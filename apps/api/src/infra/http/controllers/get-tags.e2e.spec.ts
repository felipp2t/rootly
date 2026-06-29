import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('GET /tags', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.refreshTokens)
    await db.delete(schema.tags)
    await db.delete(schema.workspaceMembers)
    await db.delete(schema.workspaceInvites)
    await db.delete(schema.rolePermissions)
    await db.delete(schema.workspaceRoles)
    await db.delete(schema.workspaces)
    await db.delete(schema.users)
  })

  async function createUserAndGetCookieAndWorkspaceId() {
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

    const workspaceResponse = await app.inject({
      method: 'POST',
      url: '/api/workspaces',
      headers: { cookie: cookieHeader },
      payload: { name: 'My Workspace' },
    })

    const workspaceId =
      workspaceResponse.json<{ workspaceId: string }>().workspaceId

    return { cookieHeader, workspaceId }
  }

  it('should return 200 with the list of tags for the workspace', async () => {
    const { cookieHeader, workspaceId } =
      await createUserAndGetCookieAndWorkspaceId()

    await app.inject({
      method: 'POST',
      url: '/api/tags',
      headers: { cookie: cookieHeader },
      payload: { name: 'Important', color: 'red', workspaceId },
    })

    const response = await app.inject({
      method: 'GET',
      url: `/api/tags?workspaceId=${workspaceId}`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      tags: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: 'Important',
          slug: expect.any(String),
          color: 'red',
          workspaceId,
          createdAt: expect.any(String),
        }),
      ]),
    })
  })
})
