import { FakeHasher } from '@test/cryptography/faker-hasher.ts'
import { makeRefreshToken } from '@test/factories/make-refresh-token.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { InMemoryRefreshTokenRepository } from '@test/repositories/in-memory-refresh-token-repository.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { ChangePasswordUseCase } from './change-password.ts'
import { WrongCredentialsError } from './errors/wrong-credencials-error.ts'

let inMemoryUserRepository: InMemoryUserRepository
let inMemoryRefreshTokenRepository: InMemoryRefreshTokenRepository
let fakeHasher: FakeHasher

let sut: ChangePasswordUseCase

describe('ChangePassword', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository()
    inMemoryRefreshTokenRepository = new InMemoryRefreshTokenRepository()
    fakeHasher = new FakeHasher()

    sut = new ChangePasswordUseCase(
      inMemoryUserRepository,
      fakeHasher,
      fakeHasher,
      inMemoryRefreshTokenRepository,
    )
  })

  it('should be able to change the password', async () => {
    const user = makeUser({
      passwordHash: '123456-hashed',
    })

    inMemoryUserRepository.items.push(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      currentPassword: '123456',
      newPassword: 'newpassword',
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryUserRepository.items[0].passwordHash).toBe('newpassword-hashed')
  })

  it('should revoke all refresh tokens for the user after a successful password change', async () => {
    const user = makeUser({
      passwordHash: '123456-hashed',
    })

    inMemoryUserRepository.items.push(user)

    const refreshToken = makeRefreshToken({ userId: user.id.toString() })
    inMemoryRefreshTokenRepository.items.push(refreshToken)

    await sut.execute({
      userId: user.id.toString(),
      currentPassword: '123456',
      newPassword: 'newpassword',
    })

    const remaining = inMemoryRefreshTokenRepository.items.filter(
      (t) => t.userId === user.id.toString(),
    )

    expect(remaining).toHaveLength(0)
  })

  it('should return WrongCredentialsError when the current password is wrong', async () => {
    const user = makeUser({
      passwordHash: '123456-hashed',
    })

    inMemoryUserRepository.items.push(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      currentPassword: 'wrong-password',
      newPassword: 'newpassword',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('should return WrongCredentialsError when the user does not exist', async () => {
    const result = await sut.execute({
      userId: 'non-existent-user-id',
      currentPassword: '123456',
      newPassword: 'newpassword',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })
})
