import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('GET /notifications', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.notifications)
    await db.delete(schema.refreshTokens)
    await db.delete(schema.users)
  })

  async function createUserAndAuthenticate() {
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

    const sessionResponse = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { email: 'john@example.com', password: '123456' },
    })

    const setCookieHeader = sessionResponse.headers['set-cookie']
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader]
    const cookieHeader = cookies.map((c) => c?.split(';')[0]).join('; ')

    return { userId, cookieHeader }
  }

  it('should list the authenticated user notifications and return 200', async () => {
    const { userId, cookieHeader } = await createUserAndAuthenticate()

    await db.insert(schema.notifications).values({
      recipientId: userId,
      title: 'Você foi convidado',
      content: 'Você recebeu um convite',
      metadata: { type: 'workspace_invite', inviteId: 'invite-1' },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/api/notifications',
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      notifications: [
        {
          id: expect.any(String),
          title: 'Você foi convidado',
          metadata: { type: 'workspace_invite', inviteId: 'invite-1' },
          readAt: null,
        },
      ],
    })
  })
})
