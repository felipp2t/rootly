import { eq } from 'drizzle-orm'
import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('POST /tags', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
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

  it('should create a tag and return 201 with tagId', async () => {
    const workspaceId = await createUserAndGetWorkspaceId()

    const response = await app.inject({
      method: 'POST',
      url: '/api/tags',
      payload: { name: 'Important', color: 'red', workspaceId },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ tagId: expect.any(String) })
  })
})
