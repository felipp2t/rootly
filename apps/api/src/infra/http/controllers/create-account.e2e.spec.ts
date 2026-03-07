import { app } from '@/app.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { schema } from '@/infra/db/drizzle/schema/index.ts'

describe('POST /accounts', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await db.delete(schema.items)
    await db.delete(schema.workspaces)
    await db.delete(schema.users)
  })

  it('should create an account and return 201 with userId', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/accounts',
      payload: {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ userId: expect.any(String) })
  })

  it('should return 409 when email is already taken', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/accounts',
      payload: {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/accounts',
      payload: {
        name: 'Jane Doe',
        email: 'john@example.com',
        password: '654321',
      },
    })

    expect(response.statusCode).toBe(409)
  })

  it('should return 422 when password has fewer than 6 characters', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/accounts',
      payload: { name: 'John Doe', email: 'john@example.com', password: '123' },
    })

    expect(response.statusCode).toBe(400)
  })
})
