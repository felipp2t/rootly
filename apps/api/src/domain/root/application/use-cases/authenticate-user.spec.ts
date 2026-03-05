import { FakeEncrypter } from '@test/cryptography/faker-encryper.ts'
import { FakeHasher } from '@test/cryptography/faker-hasher.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { AuthenticateUserUseCase } from './authenticate-user.ts'

let inMemoryUserRepository: InMemoryUserRepository
let fakeHasher: FakeHasher
let encrypter: FakeEncrypter

let sut: AuthenticateUserUseCase

describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository()
    fakeHasher = new FakeHasher()
    encrypter = new FakeEncrypter()

    sut = new AuthenticateUserUseCase(
      inMemoryUserRepository,
      fakeHasher,
      encrypter,
    )
  })

  it('should be able to authenticate a user', async () => {
    const student = makeUser({
      email: 'johndoe@example.com',
      passwordHash: await fakeHasher.hash('123456'),
    })

    inMemoryUserRepository.items.push(student)

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    })
  })
})
