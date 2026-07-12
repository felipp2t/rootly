import { makeRefreshToken } from '@test/factories/make-refresh-token.ts'
import { InMemoryRefreshTokenRepository } from '@test/repositories/in-memory-refresh-token-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { InvalidRefreshTokenError } from './errors/invalid-refresh-token-error.ts'
import { LogoutUseCase } from './logout.ts'

let inMemoryRefreshTokenRepository: InMemoryRefreshTokenRepository
let sut: LogoutUseCase

describe('Logout', () => {
  beforeEach(() => {
    inMemoryRefreshTokenRepository = new InMemoryRefreshTokenRepository()
    sut = new LogoutUseCase(inMemoryRefreshTokenRepository)
  })

  it('should be able to logout and delete the refresh token', {
    tags: ['logout'],
  }, async () => {
    const refreshToken = makeRefreshToken({
      userId: new UniqueEntityID().toString(),
    })
    inMemoryRefreshTokenRepository.items.push(refreshToken)

    const result = await sut.execute({ refreshToken: refreshToken.token })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({})
  })

  it('should remove the refresh token from the repository on success', {
    tags: ['logout'],
  }, async () => {
    const refreshToken = makeRefreshToken({
      userId: new UniqueEntityID().toString(),
    })
    inMemoryRefreshTokenRepository.items.push(refreshToken)

    await sut.execute({ refreshToken: refreshToken.token })

    expect(inMemoryRefreshTokenRepository.items).toHaveLength(0)
  })

  it('should return InvalidRefreshTokenError when token does not exist', {
    tags: ['logout'],
  }, async () => {
    const result = await sut.execute({ refreshToken: 'nonexistent-token' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError)
  })
})
