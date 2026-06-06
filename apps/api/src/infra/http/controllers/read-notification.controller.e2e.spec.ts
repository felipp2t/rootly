import { eq } from 'drizzle-orm'
import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('PATCH /notifications/:notificationId/read', () => {
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

  it('should mark a notification as read and return 204', async () => {
    const { userId, cookieHeader } = await createUserAndAuthenticate()

    const [notification] = await db
      .insert(schema.notifications)
      .values({
        recipientId: userId,
        title: 'Você foi convidado',
        content: 'Você recebeu um convite',
        metadata: { type: 'info' },
      })
      .returning()

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/notifications/${notification.id}/read`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(204)

    const [updated] = await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.id, notification.id))

    expect(updated.readAt).not.toBeNull()
  })
})
