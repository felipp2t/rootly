import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('PATCH /items/:itemId/tags/:tagId', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.refreshTokens)
    await db.delete(schema.items)
    await db.delete(schema.folders)
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

  async function createTag(cookieHeader: string, workspaceId: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/tags',
      headers: { cookie: cookieHeader },
      payload: { name: 'Important', color: 'blue', workspaceId },
    })

    return response.json<{ tagId: string }>().tagId
  }

  async function createItem(cookieHeader: string, workspaceId: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/items',
      headers: { cookie: cookieHeader },
      payload: {
        title: 'My Item',
        type: 'text',
        workspaceId,
      },
    })

    return response.json<{ itemId: string }>().itemId
  }

  it('should assign a tag to an item and return 204', async () => {
    const { cookieHeader, workspaceId } =
      await createUserAndGetCookieAndWorkspaceId()
    const tagId = await createTag(cookieHeader, workspaceId)
    const itemId = await createItem(cookieHeader, workspaceId)

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/items/${itemId}/tags/${tagId}`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(204)
  })
})
