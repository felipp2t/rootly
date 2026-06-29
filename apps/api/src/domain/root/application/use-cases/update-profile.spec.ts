import { makeUser } from '@test/factories/make-user.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { UpdateProfileUseCase } from './update-profile.ts'
import { InvalidProfileNameError } from './errors/invalid-profile-name-error.ts'

let userRepository: InMemoryUserRepository
let sut: UpdateProfileUseCase

describe('UpdateProfile', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    sut = new UpdateProfileUseCase(userRepository)
  })

  it('should be able to update the user name', async () => {
    const user = makeUser({ name: 'Old Name' })
    userRepository.items.push(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      name: 'New Name',
    })

    expect(result.isRight()).toBe(true)
    expect(userRepository.items[0].name).toBe('New Name')
  })

  it('should return InvalidProfileNameError when the name is too short after trim', async () => {
    const user = makeUser({ name: 'Old Name' })
    userRepository.items.push(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      name: '  a  ',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidProfileNameError)
  })

  it('should return NotAllowedError when the user does not exist', async () => {
    const result = await sut.execute({
      userId: 'non-existent-id',
      name: 'New Name',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
