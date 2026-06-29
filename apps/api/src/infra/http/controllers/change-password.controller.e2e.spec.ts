import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('PATCH /me/password', () => {
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

  it('should return 204 when changing password with correct current password', async () => {
    const cookieHeader = await createUserAndGetCookieHeader()

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/me/password',
      headers: { cookie: cookieHeader },
      payload: {
        currentPassword: 'password123',
        newPassword: 'newpassword456',
        confirmPassword: 'newpassword456',
      },
    })

    expect(response.statusCode).toBe(204)
  })

  it('should allow authenticating with the new password after changing it', async () => {
    const cookieHeader = await createUserAndGetCookieHeader()

    await app.inject({
      method: 'PATCH',
      url: '/api/me/password',
      headers: { cookie: cookieHeader },
      payload: {
        currentPassword: 'password123',
        newPassword: 'newpassword456',
        confirmPassword: 'newpassword456',
      },
    })

    const sessionResponse = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { email: 'john@example.com', password: 'newpassword456' },
    })

    expect(sessionResponse.statusCode).toBe(201)
  })

  it('should return 401 when current password is wrong', async () => {
    const cookieHeader = await createUserAndGetCookieHeader()

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/me/password',
      headers: { cookie: cookieHeader },
      payload: {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword456',
        confirmPassword: 'newpassword456',
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('should return 400 when confirmPassword does not match newPassword', async () => {
    const cookieHeader = await createUserAndGetCookieHeader()

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/me/password',
      headers: { cookie: cookieHeader },
      payload: {
        currentPassword: 'password123',
        newPassword: 'newpassword456',
        confirmPassword: 'differentpassword',
      },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should return 400 when newPassword is shorter than 8 characters', async () => {
    const cookieHeader = await createUserAndGetCookieHeader()

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/me/password',
      headers: { cookie: cookieHeader },
      payload: {
        currentPassword: 'password123',
        newPassword: 'short',
        confirmPassword: 'short',
      },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should return 401 when no auth cookie is provided', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/me/password',
      payload: {
        currentPassword: 'password123',
        newPassword: 'newpassword456',
        confirmPassword: 'newpassword456',
      },
    })

    expect(response.statusCode).toBe(401)
  })
})
