import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('POST /sessions', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.items)
    await db.delete(schema.workspaces)
    await db.delete(schema.users)
  })

  it('should authenticate and return 201 with accessToken', async () => {
    await app.inject({
      method: 'POST',
      url: '/accounts',
      payload: {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/sessions',
      payload: { email: 'john@example.com', password: '123456' },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ accessToken: expect.any(String) })
  })

  it('should return 401 when password is wrong', async () => {
    await app.inject({
      method: 'POST',
      url: '/accounts',
      payload: {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/sessions',
      payload: { email: 'john@example.com', password: 'wrong-password' },
    })

    expect(response.statusCode).toBe(401)
  })

  it('should return 401 when email does not exist', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/sessions',
      payload: { email: 'nonexistent@example.com', password: '123456' },
    })

    expect(response.statusCode).toBe(401)
  })
})
