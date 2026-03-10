import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { FakeEncrypter } from '@test/cryptography/faker-encryper.ts'
import { makeRefreshToken } from '@test/factories/make-refresh-token.ts'
import { InMemoryRefreshTokenRepository } from '@test/repositories/in-memory-refresh-token-repository.ts'
import { RefreshAccessTokenUseCase } from './refresh-access-token.ts'
import { InvalidRefreshTokenError } from './errors/invalid-refresh-token-error.ts'

let inMemoryRefreshTokenRepository: InMemoryRefreshTokenRepository
let encrypter: FakeEncrypter

let sut: RefreshAccessTokenUseCase

describe('RefreshAccessToken', () => {
  beforeEach(() => {
    inMemoryRefreshTokenRepository = new InMemoryRefreshTokenRepository()
    encrypter = new FakeEncrypter()

    sut = new RefreshAccessTokenUseCase(
      inMemoryRefreshTokenRepository,
      encrypter,
    )
  })

  it('should be able to refresh an access token', async () => {
    const userId = new UniqueEntityID().toString()

    const refreshToken = makeRefreshToken({ userId })
    inMemoryRefreshTokenRepository.items.push(refreshToken)

    const result = await sut.execute({ token: refreshToken.token })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    })
  })

  it('should remove the old refresh token and persist a new one on success', async () => {
    const userId = new UniqueEntityID().toString()

    const refreshToken = makeRefreshToken({ userId })
    inMemoryRefreshTokenRepository.items.push(refreshToken)

    const result = await sut.execute({ token: refreshToken.token })

    expect(result.isRight()).toBe(true)
    expect(inMemoryRefreshTokenRepository.items).toHaveLength(1)
    expect(inMemoryRefreshTokenRepository.items[0].token).not.toBe(refreshToken.token)
    expect(inMemoryRefreshTokenRepository.items[0].userId).toBe(userId)
  })

  it('should return InvalidRefreshTokenError when token does not exist', async () => {
    const result = await sut.execute({ token: 'nonexistent-token' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError)
  })

  it('should return InvalidRefreshTokenError when token is expired', async () => {
    const userId = new UniqueEntityID().toString()
    const pastDate = new Date(Date.now() - 1000)

    const refreshToken = makeRefreshToken({ userId, expiresAt: pastDate })
    inMemoryRefreshTokenRepository.items.push(refreshToken)

    const result = await sut.execute({ token: refreshToken.token })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError)
  })

  it('should remove an expired refresh token from the repository', async () => {
    const userId = new UniqueEntityID().toString()
    const pastDate = new Date(Date.now() - 1000)

    const refreshToken = makeRefreshToken({ userId, expiresAt: pastDate })
    inMemoryRefreshTokenRepository.items.push(refreshToken)

    await sut.execute({ token: refreshToken.token })

    expect(inMemoryRefreshTokenRepository.items).toHaveLength(0)
  })
})
