import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('POST /folders', () => {
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

  it('should create a folder and return 201 with folderId', async () => {
    const { cookieHeader, workspaceId } =
      await createUserAndGetCookieAndWorkspaceId()

    const response = await app.inject({
      method: 'POST',
      url: '/api/folders',
      headers: { cookie: cookieHeader },
      payload: { name: 'My Folder', workspaceId },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ folderId: expect.any(String) })
  })

  it('should create a subfolder inside a parent folder', async () => {
    const { cookieHeader, workspaceId } =
      await createUserAndGetCookieAndWorkspaceId()

    const parentResponse = await app.inject({
      method: 'POST',
      url: '/api/folders',
      headers: { cookie: cookieHeader },
      payload: { name: 'Parent', workspaceId },
    })

    const { folderId: parentId } = parentResponse.json<{ folderId: string }>()

    const response = await app.inject({
      method: 'POST',
      url: '/api/folders',
      headers: { cookie: cookieHeader },
      payload: { name: 'Child', workspaceId, parentId },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ folderId: expect.any(String) })
  })
})
