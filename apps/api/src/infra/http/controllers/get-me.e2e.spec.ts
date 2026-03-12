import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('GET /me', () => {
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

  async function createUserAndGetAccessToken() {
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

    return sessionResponse.json<{ accessToken: string; refreshToken: string }>().accessToken
  }

  it('should return 200 with the authenticated user information', async () => {
    const accessToken = await createUserAndGetAccessToken()

    const response = await app.inject({
      method: 'GET',
      url: '/api/me',
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      id: expect.any(String),
      name: 'John Doe',
      email: 'john@example.com',
    })
  })
})
