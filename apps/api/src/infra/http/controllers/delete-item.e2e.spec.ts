import { eq } from 'drizzle-orm'
import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('DELETE /items/:itemId', () => {
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

    const { workspaceId } = workspaceResponse.json<{ workspaceId: string }>()

    return { cookieHeader, workspaceId }
  }

  async function createItem(
    cookieHeader: string,
    workspaceId: string,
    folderId?: string,
  ) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/items',
      headers: { cookie: cookieHeader },
      payload: {
        title: 'My Link',
        workspaceId,
        ...(folderId ? { folderId } : {}),
        type: 'link',
        content: 'https://example.com',
      },
    })

    const { itemId } = response.json<{ itemId: string }>()

    return itemId
  }

  it('should permanently delete an already-archived item and return 204', async () => {
    const { cookieHeader, workspaceId } =
      await createUserAndGetCookieAndWorkspaceId()
    const itemId = await createItem(cookieHeader, workspaceId)

    await app.inject({
      method: 'POST',
      url: `/api/items/${itemId}/archive`,
      headers: { cookie: cookieHeader },
    })

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/items/${itemId}`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(204)
    expect(response.body).toBe('')

    const rows = await db
      .select()
      .from(schema.items)
      .where(eq(schema.items.id, itemId))

    expect(rows).toHaveLength(0)
  })
})
