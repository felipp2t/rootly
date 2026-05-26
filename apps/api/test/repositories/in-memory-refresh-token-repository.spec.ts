import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { makeRefreshToken } from 'test/factories/make-refresh-token.ts'
import { InMemoryRefreshTokenRepository } from './in-memory-refresh-token-repository.ts'

describe('InMemoryRefreshTokenRepository', () => {
  let repo: InMemoryRefreshTokenRepository

  beforeEach(() => {
    repo = new InMemoryRefreshTokenRepository()
  })

  describe('create', () => {
    it('should add a refresh token to items', async () => {
      const token = makeRefreshToken({ userId: 'u-1' })
      await repo.create(token)
      expect(repo.items).toHaveLength(1)
      expect(repo.items[0]).toBe(token)
    })
  })

  describe('findByToken', () => {
    it('should return the refresh token when the token string matches', async () => {
      const token = makeRefreshToken({ userId: 'u-1', token: 'tok-abc' })
      await repo.create(token)

      const result = await repo.findByToken('tok-abc')

      expect(result).toBe(token)
    })

    it('should return null when no token matches', async () => {
      const token = makeRefreshToken({ userId: 'u-1', token: 'tok-abc' })
      await repo.create(token)

      const result = await repo.findByToken('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should remove the refresh token by id', async () => {
      const id = new UniqueEntityID('rt-del')
      const token = makeRefreshToken({ userId: 'u-1' }, id)
      await repo.create(token)

      await repo.delete('rt-del')

      expect(repo.items).toHaveLength(0)
    })

    it('should do nothing when id does not exist', async () => {
      const token = makeRefreshToken({ userId: 'u-1' })
      await repo.create(token)

      await repo.delete('nonexistent')

      expect(repo.items).toHaveLength(1)
    })
  })
})
