import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('POST /sessions/refresh', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.refreshTokens)
    await db.delete(schema.items)
    await db.delete(schema.workspaces)
    await db.delete(schema.users)
  })

  it('should exchange a valid refresh token for new accessToken and refreshToken cookies', async () => {
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

    const sessionCookies = Array.isArray(sessionResponse.headers['set-cookie'])
      ? sessionResponse.headers['set-cookie']
      : [sessionResponse.headers['set-cookie']]

    const cookieHeader = sessionCookies.map((c) => c.split(';')[0]).join('; ')

    const response = await app.inject({
      method: 'POST',
      url: '/api/sessions/refresh',
      headers: { cookie: cookieHeader },
    })

    const refreshedCookies = Array.isArray(response.headers['set-cookie'])
      ? response.headers['set-cookie']
      : [response.headers['set-cookie']]

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({})
    expect(refreshedCookies.some((c) => c?.startsWith('accessToken='))).toBe(
      true,
    )
    expect(refreshedCookies.some((c) => c?.startsWith('refreshToken='))).toBe(
      true,
    )
  })
})
