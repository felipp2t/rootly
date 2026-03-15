import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('GET /items', () => {
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

    const workspaceId =
      workspaceResponse.json<{ workspaceId: string }>().workspaceId

    return { cookieHeader, workspaceId }
  }

  async function createFolder(cookieHeader: string, workspaceId: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/folders',
      headers: { cookie: cookieHeader },
      payload: { name: 'My Folder', workspaceId },
    })

    return response.json<{ folderId: string }>().folderId
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
        title: `Item ${Math.random()}`,
        type: 'text',
        workspaceId,
        folderId,
      },
    })

    return response.json<{ itemId: string }>().itemId
  }

  it('should return root items when parentId is omitted', async () => {
    const { cookieHeader, workspaceId } =
      await createUserAndGetCookieAndWorkspaceId()
    await createItem(cookieHeader, workspaceId)
    await createItem(cookieHeader, workspaceId)

    const response = await app.inject({
      method: 'GET',
      url: '/api/items',
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().items).toHaveLength(2)
  })

  it('should return items inside a folder when parentId is provided', async () => {
    const { cookieHeader, workspaceId } =
      await createUserAndGetCookieAndWorkspaceId()
    const folderId = await createFolder(cookieHeader, workspaceId)
    await createItem(cookieHeader, workspaceId, folderId)
    await createItem(cookieHeader, workspaceId, folderId)

    const response = await app.inject({
      method: 'GET',
      url: `/api/items?parentId=${folderId}`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().items).toHaveLength(2)
  })
})
