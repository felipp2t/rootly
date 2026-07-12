import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('GET /workspaces/:workspaceId/activity', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.activityLogs)
    await db.delete(schema.refreshTokens)
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

    const meResponse = await app.inject({
      method: 'GET',
      url: '/api/me',
      headers: { cookie: cookieHeader },
    })

    return {
      cookieHeader,
      userId: meResponse.json<{ id: string }>().id,
    }
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

  it('should list the activity log of a workspace and return 200', async () => {
    const { cookieHeader, userId } = await createUserAndAuthenticate()
    const workspaceId = await createWorkspace(cookieHeader)

    await db.insert(schema.activityLogs).values({
      workspaceId,
      resourceType: 'folder',
      resourceId: 'folder-1',
      resourceName: 'Docs',
      action: 'folder_created',
      actorUserId: userId,
      actorName: 'John Doe',
    })

    const response = await app.inject({
      method: 'GET',
      url: `/api/workspaces/${workspaceId}/activity`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      activityLogs: [
        {
          resourceType: 'folder',
          resourceId: 'folder-1',
          resourceName: 'Docs',
          action: 'folder_created',
          actorUserId: userId,
          actorName: 'John Doe',
        },
      ],
    })
  })
})
