import { makeUser } from '@test/factories/make-user.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { GetMeUseCase } from './get-me.ts'

let userRepository: InMemoryUserRepository
let sut: GetMeUseCase

describe('GetMe', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    sut = new GetMeUseCase(userRepository)
  })

  it('should return the user when a valid userId is provided', async () => {
    const user = makeUser()
    userRepository.items.push(user)

    const result = await sut.execute({ userId: user.id.toString() })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({ user })
  })

  it('should return the correct user entity from the repository', async () => {
    const user = makeUser({ name: 'John Doe', email: 'john@example.com' })
    userRepository.items.push(user)

    const result = await sut.execute({ userId: user.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.user.id.toString()).toBe(user.id.toString())
      expect(result.value.user.name).toBe('John Doe')
      expect(result.value.user.email).toBe('john@example.com')
    }
  })

  it('should return NotAllowedError when the userId does not exist', async () => {
    const result = await sut.execute({ userId: 'non-existent-id' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
