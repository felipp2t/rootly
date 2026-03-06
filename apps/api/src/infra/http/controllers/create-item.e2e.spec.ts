import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'
import { eq } from 'drizzle-orm'

describe('POST /items', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.items)
    await db.delete(schema.workspaces)
    await db.delete(schema.users)
  })

  async function createFolderAndGetId() {
    const accountResponse = await app.inject({
      method: 'POST',
      url: '/accounts',
      payload: { name: 'John Doe', email: 'john@example.com', password: '123456' },
    })

    const { userId } = accountResponse.json<{ userId: string }>()

    const [workspace] = await db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.userId, userId))

    const folderResponse = await app.inject({
      method: 'POST',
      url: '/folders',
      payload: { name: 'My Folder', workspaceId: workspace.id },
    })

    const { folderId } = folderResponse.json<{ folderId: string }>()

    return folderId
  }

  it('should create an item and return 201 with itemId', async () => {
    const folderId = await createFolderAndGetId()

    const response = await app.inject({
      method: 'POST',
      url: '/items',
      payload: { title: 'My Link', folderId, type: 'link', content: 'https://example.com' },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ itemId: expect.any(String) })
  })

  it('should return 409 when item with the same title already exists in the same folder', async () => {
    const folderId = await createFolderAndGetId()

    await app.inject({
      method: 'POST',
      url: '/items',
      payload: { title: 'My Link', folderId, type: 'link', content: 'https://example.com' },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/items',
      payload: { title: 'My Link', folderId, type: 'link', content: 'https://example.com' },
    })

    expect(response.statusCode).toBe(409)
  })

  it('should return 400 when item type is invalid', async () => {
    const folderId = await createFolderAndGetId()

    const response = await app.inject({
      method: 'POST',
      url: '/items',
      payload: { title: 'My Item', folderId, type: 'invalid-type' },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should return 400 when link content is not a valid HTTPS URL', async () => {
    const folderId = await createFolderAndGetId()

    const response = await app.inject({
      method: 'POST',
      url: '/items',
      payload: { title: 'My Link', folderId, type: 'link', content: 'not-a-url' },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should create items of all valid types', async () => {
    const folderId = await createFolderAndGetId()

    const payloads = [
      { title: 'My link', folderId, type: 'link', content: 'https://example.com' },
      { title: 'My document', folderId, type: 'document', content: 'Some document content' },
      { title: 'My secret', folderId, type: 'secret', content: 'supersecret123' },
      { title: 'My text', folderId, type: 'text' },
    ] as const

    for (const payload of payloads) {
      const response = await app.inject({
        method: 'POST',
        url: '/items',
        payload,
      })

      expect(response.statusCode).toBe(201)
    }
  })
})
