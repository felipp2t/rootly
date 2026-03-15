import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('POST /items', () => {
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

  async function createFolder(
    cookieHeader: string,
    workspaceId: string,
  ) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/folders',
      headers: { cookie: cookieHeader },
      payload: { name: 'My Folder', workspaceId },
    })

    const { folderId } = response.json<{ folderId: string }>()

    return folderId
  }

  it('should create an item inside a folder and return 201 with itemId', async () => {
    const { cookieHeader, workspaceId } =
      await createUserAndGetCookieAndWorkspaceId()
    const folderId = await createFolder(cookieHeader, workspaceId)

    const response = await app.inject({
      method: 'POST',
      url: '/api/items',
      headers: { cookie: cookieHeader },
      payload: {
        title: 'My Link',
        workspaceId,
        folderId,
        type: 'link',
        content: 'https://example.com',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ itemId: expect.any(String) })
  })

  it('should create an item without a folder and return 201 with itemId', async () => {
    const { cookieHeader, workspaceId } =
      await createUserAndGetCookieAndWorkspaceId()

    const response = await app.inject({
      method: 'POST',
      url: '/api/items',
      headers: { cookie: cookieHeader },
      payload: {
        title: 'My Link',
        workspaceId,
        type: 'link',
        content: 'https://example.com',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ itemId: expect.any(String) })
  })

  it('should create items of all valid types', async () => {
    const { cookieHeader, workspaceId } =
      await createUserAndGetCookieAndWorkspaceId()
    const folderId = await createFolder(cookieHeader, workspaceId)

    const payloads = [
      {
        title: 'My link',
        workspaceId,
        folderId,
        type: 'link',
        content: 'https://example.com',
      },
      {
        title: 'My document',
        workspaceId,
        folderId,
        type: 'document',
        content: 'Some document content',
      },
      {
        title: 'My secret',
        workspaceId,
        folderId,
        type: 'secret',
        content: 'supersecret123',
      },
      {
        title: 'My text',
        workspaceId,
        folderId,
        type: 'text',
      },
    ] as const

    for (const payload of payloads) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/items',
        headers: { cookie: cookieHeader },
        payload,
      })

      expect(response.statusCode).toBe(201)
    }
  })
})
