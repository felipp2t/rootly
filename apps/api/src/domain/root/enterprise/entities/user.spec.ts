import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { User } from './user.ts'

describe('User', () => {
  it('should create a user with default timestamps', () => {
    const before = new Date()
    const user = User.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed-password',
    })
    const after = new Date()

    expect(user.name).toBe('John Doe')
    expect(user.email).toBe('john@example.com')
    expect(user.passwordHash).toBe('hashed-password')
    expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(user.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should create a user with explicit timestamps', () => {
    const createdAt = new Date('2024-01-01')
    const updatedAt = new Date('2024-01-02')

    const user = User.create({
      name: 'Jane',
      email: 'jane@example.com',
      passwordHash: 'hash',
      createdAt,
      updatedAt,
    })

    expect(user.createdAt).toEqual(createdAt)
    expect(user.updatedAt).toEqual(updatedAt)
  })

  it('should auto-generate a uuid id when no id is provided', () => {
    const user = User.create({
      name: 'Bob',
      email: 'bob@example.com',
      passwordHash: 'hash',
    })

    expect(user.id.toString()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  })

  it('should create a user with a provided id', () => {
    const id = new UniqueEntityID('user-fixed-id')
    const user = User.create(
      { name: 'Alice', email: 'alice@example.com', passwordHash: 'hash' },
      id,
    )

    expect(user.id.toString()).toBe('user-fixed-id')
  })

  it('should generate different ids for different users created without an id', () => {
    const user1 = User.create({ name: 'A', email: 'a@a.com', passwordHash: 'h' })
    const user2 = User.create({ name: 'B', email: 'b@b.com', passwordHash: 'h' })

    expect(user1.id.toString()).not.toBe(user2.id.toString())
  })
})
