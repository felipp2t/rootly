import { eq } from 'drizzle-orm'
import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('POST /folders', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.items)
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

    const [workspace] = await db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.userId, userId))

    return workspace.id
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

  it('should return 409 when folder with the same name already exists', async () => {
    const workspaceId = await createUserAndGetWorkspaceId()

    await app.inject({
      method: 'POST',
      url: '/api/folders',
      payload: { name: 'My Folder', workspaceId },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/folders',
      payload: { name: 'My Folder', workspaceId },
    })

    expect(response.statusCode).toBe(409)
  })

  it('should return 400 when folder name has fewer than 3 characters', async () => {
    const workspaceId = await createUserAndGetWorkspaceId()

    const response = await app.inject({
      method: 'POST',
      url: '/api/folders',
      payload: { name: 'ab', workspaceId },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should return 400 when folder name has more than 32 characters', async () => {
    const workspaceId = await createUserAndGetWorkspaceId()

    const response = await app.inject({
      method: 'POST',
      url: '/api/folders',
      payload: { name: 'a'.repeat(33), workspaceId },
    })

    expect(response.statusCode).toBe(400)
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
