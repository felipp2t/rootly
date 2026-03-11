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

    const { workspaceId } = workspaceResponse.json<{ workspaceId: string }>()

    return workspaceId
  }

  it('should create a folder and return 201 with folderId', async () => {
    const workspaceId = await createUserAndGetWorkspaceId()

    const response = await app.inject({
      method: 'POST',
      url: '/api/folders',
      payload: { name: 'My Folder', workspaceId },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ folderId: expect.any(String) })
  })

  it('should create a subfolder inside a parent folder', async () => {
    const workspaceId = await createUserAndGetWorkspaceId()

    const parentResponse = await app.inject({
      method: 'POST',
      url: '/api/folders',
      payload: { name: 'Parent', workspaceId },
    })

    const { folderId: parentId } = parentResponse.json<{ folderId: string }>()

    const response = await app.inject({
      method: 'POST',
      url: '/api/folders',
      payload: { name: 'Child', workspaceId, parentId },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ folderId: expect.any(String) })
  })
})
