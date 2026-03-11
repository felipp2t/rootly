import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('GET /folders', () => {
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

  async function createFolder(workspaceId: string, parentId?: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/folders',
      payload: { name: `Folder ${Math.random()}`, workspaceId, parentId },
    })

    return response.json<{ folderId: string }>().folderId
  }

  it('should return root folders when parentId is omitted', async () => {
    const workspaceId = await createUserAndGetWorkspaceId()
    await createFolder(workspaceId)
    await createFolder(workspaceId)

    const response = await app.inject({
      method: 'GET',
      url: '/api/folders',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().folders).toHaveLength(2)
  })

  it('should return subfolders when parentId is provided', async () => {
    const workspaceId = await createUserAndGetWorkspaceId()
    const parentId = await createFolder(workspaceId)
    await createFolder(workspaceId, parentId)
    await createFolder(workspaceId, parentId)

    const response = await app.inject({
      method: 'GET',
      url: `/api/folders?parentId=${parentId}`,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().folders).toHaveLength(2)
  })
})
