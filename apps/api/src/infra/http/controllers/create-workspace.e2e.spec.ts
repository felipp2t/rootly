import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('POST /workspaces', () => {
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

  async function createUserAndGetId() {
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

    return userId
  }

  it('should create a workspace and return 201 with workspaceId', async () => {
    const userId = await createUserAndGetId()

    const response = await app.inject({
      method: 'POST',
      url: '/api/workspaces',
      payload: { name: 'My Workspace', userId },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ workspaceId: expect.any(String) })
  })
})
