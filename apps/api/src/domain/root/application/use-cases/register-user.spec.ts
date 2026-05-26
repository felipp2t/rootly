import { FakeHasher } from '@test/cryptography/faker-hasher.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { EmailAlreadyExistsError } from './errors/email-already-exists-error.ts'
import { RegisterUserUseCase } from './register-user.ts'

let inMemoryUserRepository: InMemoryUserRepository
let fakeHasher: FakeHasher

let sut: RegisterUserUseCase

describe('Register User', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository()
    fakeHasher = new FakeHasher()

    sut = new RegisterUserUseCase(inMemoryUserRepository, fakeHasher)
  })

  it('should be able to register a new user', {
    tags: ['register-user'],
  }, async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      userId: inMemoryUserRepository.items[0].id.toString(),
    })
  })

  it('should hash user password upon registration', {
    tags: ['register-user'],
  }, async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    const hashedPassword = await fakeHasher.hash('123456')

    expect(result.isRight()).toBe(true)
    expect(inMemoryUserRepository.items[0].passwordHash).toEqual(hashedPassword)
  })

  it('should not be able to register a user with an email already in use', {
    tags: ['register-user'],
  }, async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    const result = await sut.execute({
      name: 'Another User',
      email: 'johndoe@example.com',
      password: 'abcdef',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(EmailAlreadyExistsError)
    expect(inMemoryUserRepository.items).toHaveLength(1)
  })
})
