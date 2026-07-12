import { eq } from 'drizzle-orm'
import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('PATCH /items/:itemId', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.activityLogs)
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

  async function createItem(cookieHeader: string, workspaceId: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/items',
      headers: { cookie: cookieHeader },
      payload: {
        title: 'Old Title',
        workspaceId,
        type: 'text',
        content: 'old content',
      },
    })

    const { itemId } = response.json<{ itemId: string }>()

    return itemId
  }

  it("should update an item's title and content, and return 204", async () => {
    const { cookieHeader, workspaceId } =
      await createUserAndGetCookieAndWorkspaceId()
    const itemId = await createItem(cookieHeader, workspaceId)

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/items/${itemId}`,
      headers: { cookie: cookieHeader },
      payload: { title: 'New Title', content: 'new content' },
    })

    expect(response.statusCode).toBe(204)
    expect(response.body).toBe('')

    const [item] = await db
      .select()
      .from(schema.items)
      .where(eq(schema.items.id, itemId))

    expect(item.title).toBe('New Title')
    expect(item.content).toBe('new content')
  })
})
