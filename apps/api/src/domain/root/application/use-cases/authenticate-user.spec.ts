import { FakeEncrypter } from '@test/cryptography/faker-encryper.ts'
import { FakeHasher } from '@test/cryptography/faker-hasher.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { InMemoryRefreshTokenRepository } from '@test/repositories/in-memory-refresh-token-repository.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { AuthenticateUserUseCase } from './authenticate-user.ts'
import { WrongCredentialsError } from './errors/wrong-credencials-error.ts'

let inMemoryUserRepository: InMemoryUserRepository
let inMemoryRefreshTokenRepository: InMemoryRefreshTokenRepository
let fakeHasher: FakeHasher
let encrypter: FakeEncrypter

let sut: AuthenticateUserUseCase

describe('AuthenticateUser', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository()
    inMemoryRefreshTokenRepository = new InMemoryRefreshTokenRepository()
    fakeHasher = new FakeHasher()
    encrypter = new FakeEncrypter()

    sut = new AuthenticateUserUseCase(
      inMemoryUserRepository,
      fakeHasher,
      encrypter,
      inMemoryRefreshTokenRepository,
    )
  })

  it('should be able to authenticate a user', async () => {
    const user = makeUser({
      email: 'johndoe@example.com',
      passwordHash: await fakeHasher.hash('123456'),
    })

    inMemoryUserRepository.items.push(user)

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    })
  })

  it('should persist a refresh token in the repository on successful authentication', async () => {
    const user = makeUser({
      email: 'johndoe@example.com',
      passwordHash: await fakeHasher.hash('123456'),
    })

    inMemoryUserRepository.items.push(user)

    await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(inMemoryRefreshTokenRepository.items).toHaveLength(1)
    expect(inMemoryRefreshTokenRepository.items[0].userId).toBe(user.id.toString())
  })

  it('should return WrongCredentialsError when email does not exist', async () => {
    const result = await sut.execute({
      email: 'nonexistent@example.com',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('should return WrongCredentialsError when password is wrong', async () => {
    const user = makeUser({
      email: 'johndoe@example.com',
      passwordHash: await fakeHasher.hash('correct-password'),
    })

    inMemoryUserRepository.items.push(user)

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: 'wrong-password',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })
})
