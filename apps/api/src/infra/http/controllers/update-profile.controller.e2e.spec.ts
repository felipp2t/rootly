import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('PATCH /me', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.refreshTokens)
    await db.delete(schema.users)
  })

  async function createUserAndGetCookieHeader(
    email = 'john@example.com',
    password = 'password123',
  ) {
    await app.inject({
      method: 'POST',
      url: '/api/accounts',
      payload: {
        name: 'John Doe',
        email,
        password,
      },
    })

    const sessionResponse = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { email, password },
    })

    const setCookieHeader = sessionResponse.headers['set-cookie']
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader]

    return cookies.map((c) => c?.split(';')[0]).join('; ')
  }

  it('should return 204 when authenticated user updates name successfully', async () => {
    const cookieHeader = await createUserAndGetCookieHeader()

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/me',
      headers: { cookie: cookieHeader },
      payload: { name: 'Jane Doe' },
    })

    expect(response.statusCode).toBe(204)
  })

  it('should return 400 when name is shorter than 3 characters', async () => {
    const cookieHeader = await createUserAndGetCookieHeader()

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/me',
      headers: { cookie: cookieHeader },
      payload: { name: 'Jo' },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should return 401 when no auth cookie is provided', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/me',
      payload: { name: 'Jane Doe' },
    })

    expect(response.statusCode).toBe(401)
  })
})
