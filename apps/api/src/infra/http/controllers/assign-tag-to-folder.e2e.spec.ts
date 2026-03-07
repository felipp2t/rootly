import { eq } from 'drizzle-orm'
import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('PATCH /folders/:folderId/tags/:tagId', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.items)
    await db.delete(schema.folders)
    await db.delete(schema.tags)
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

  async function createTag(workspaceId: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/tags',
      payload: { name: 'Important', color: 'red', workspaceId },
    })

    return response.json<{ tagId: string }>().tagId
  }

  async function createFolder(workspaceId: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/folders',
      payload: { name: 'My Folder', workspaceId },
    })

    return response.json<{ folderId: string }>().folderId
  }

  it('should assign a tag to a folder and return 204', async () => {
    const workspaceId = await createUserAndGetWorkspaceId()
    const tagId = await createTag(workspaceId)
    const folderId = await createFolder(workspaceId)

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/folders/${folderId}/tags/${tagId}`,
    })

    expect(response.statusCode).toBe(204)
  })
})
