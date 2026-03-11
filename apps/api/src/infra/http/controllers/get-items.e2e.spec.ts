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
    await db.delete(schema.workspaces)
    await db.delete(schema.users)
  })

  async function createUserAndGetWorkspaceId() {
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

    const workspaceResponse = await app.inject({
      method: 'POST',
      url: '/api/workspaces',
      payload: { name: 'My Workspace', userId },
    })

    return workspaceResponse.json<{ workspaceId: string }>().workspaceId
  }

  async function createFolder(workspaceId: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/folders',
      payload: { name: 'My Folder', workspaceId },
    })

    return response.json<{ folderId: string }>().folderId
  }

  async function createItem(workspaceId: string, folderId?: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/items',
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
    const workspaceId = await createUserAndGetWorkspaceId()
    await createItem(workspaceId)
    await createItem(workspaceId)

    const response = await app.inject({
      method: 'GET',
      url: '/api/items',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().items).toHaveLength(2)
  })

  it('should return items inside a folder when parentId is provided', async () => {
    const workspaceId = await createUserAndGetWorkspaceId()
    const folderId = await createFolder(workspaceId)
    await createItem(workspaceId, folderId)
    await createItem(workspaceId, folderId)

    const response = await app.inject({
      method: 'GET',
      url: `/api/items?parentId=${folderId}`,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().items).toHaveLength(2)
  })
})
