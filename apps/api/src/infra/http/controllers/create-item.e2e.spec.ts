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

  async function createFolderAndGetId(workspaceId: string) {
    const folderResponse = await app.inject({
      method: 'POST',
      url: '/api/folders',
      payload: { name: 'My Folder', workspaceId },
    })

    const { folderId } = folderResponse.json<{ folderId: string }>()

    return folderId
  }

  it('should create an item inside a folder and return 201 with itemId', async () => {
    const workspaceId = await createUserAndGetWorkspaceId()
    const folderId = await createFolderAndGetId(workspaceId)

    const response = await app.inject({
      method: 'POST',
      url: '/api/items',
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
    const workspaceId = await createUserAndGetWorkspaceId()

    const response = await app.inject({
      method: 'POST',
      url: '/api/items',
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
    const workspaceId = await createUserAndGetWorkspaceId()
    const folderId = await createFolderAndGetId(workspaceId)

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
        payload,
      })

      expect(response.statusCode).toBe(201)
    }
  })
})
