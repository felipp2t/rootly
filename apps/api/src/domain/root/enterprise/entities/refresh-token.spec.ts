import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { REFRESH_TOKEN_EXPIRATION_MS, RefreshToken } from './refresh-token.ts'

describe('RefreshToken', () => {
  it('should create a refresh token with default values', () => {
    const before = new Date()
    const token = RefreshToken.create({ userId: 'user-1' })
    const after = new Date()

    expect(token.userId).toBe('user-1')
    expect(token.token).toBeDefined()
    expect(token.token.length).toBeGreaterThan(0)
    expect(token.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(token.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    expect(token.expiresAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime() + REFRESH_TOKEN_EXPIRATION_MS - 1000,
    )
    expect(token.expiresAt.getTime()).toBeLessThanOrEqual(
      after.getTime() + REFRESH_TOKEN_EXPIRATION_MS + 1000,
    )
  })

  it('should create a refresh token with an explicit token value', () => {
    const token = RefreshToken.create({
      userId: 'user-1',
      token: 'my-custom-token',
    })

    expect(token.token).toBe('my-custom-token')
  })

  it('should create a refresh token with an explicit expiresAt', () => {
    const expiresAt = new Date('2099-01-01')
    const token = RefreshToken.create({ userId: 'user-1', expiresAt })

    expect(token.expiresAt).toEqual(expiresAt)
  })

  it('should create a refresh token with an explicit createdAt', () => {
    const createdAt = new Date('2024-01-01')
    const token = RefreshToken.create({ userId: 'user-1', createdAt })

    expect(token.createdAt).toEqual(createdAt)
  })

  it('should create a refresh token with a provided id', () => {
    const id = new UniqueEntityID('token-fixed-id')
    const token = RefreshToken.create({ userId: 'user-1' }, id)

    expect(token.id.toString()).toBe('token-fixed-id')
  })

  it('should report isExpired as false when expiresAt is in the future', () => {
    const expiresAt = new Date(Date.now() + 10_000)
    const token = RefreshToken.create({ userId: 'user-1', expiresAt })

    expect(token.isExpired).toBe(false)
  })

  it('should report isExpired as true when expiresAt is in the past', () => {
    const expiresAt = new Date(Date.now() - 10_000)
    const token = RefreshToken.create({ userId: 'user-1', expiresAt })

    expect(token.isExpired).toBe(true)
  })

  it('should generate a unique token for each new refresh token', () => {
    const token1 = RefreshToken.create({ userId: 'user-1' })
    const token2 = RefreshToken.create({ userId: 'user-1' })

    expect(token1.token).not.toBe(token2.token)
  })
})
