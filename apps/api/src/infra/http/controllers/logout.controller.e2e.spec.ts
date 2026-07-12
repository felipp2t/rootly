import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('DELETE /sessions', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.refreshTokens)
    await db.delete(schema.items)
    await db.delete(schema.workspaces)
    await db.delete(schema.users)
  })

  it('should logout and clear cookies when a valid refreshToken cookie is sent', async () => {
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

    const rawCookies = sessionResponse.headers['set-cookie']
    const sessionCookies = Array.isArray(rawCookies)
      ? rawCookies
      : rawCookies
        ? [rawCookies]
        : []

    const cookieHeader = sessionCookies.map((c) => c.split(';')[0]).join('; ')

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/sessions',
      headers: { cookie: cookieHeader },
    })

    const responseCookies = Array.isArray(response.headers['set-cookie'])
      ? response.headers['set-cookie']
      : [response.headers['set-cookie']]

    expect(response.statusCode).toBe(204)
    expect(responseCookies.some((c) => c?.includes('accessToken=;'))).toBe(true)
    expect(responseCookies.some((c) => c?.includes('refreshToken=;'))).toBe(
      true,
    )
  })

  it('should return 401 when no refreshToken cookie is sent', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/sessions',
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toEqual({ message: 'Unauthorized' })
  })
})
