import { makeUser } from '@test/factories/make-user.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { InMemoryWorkspaceInviteRepository } from '@test/repositories/in-memory-workspace-invite-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { InviteUserUseCase } from './invite-user.ts'

let userRepository: InMemoryUserRepository
let workspaceInviteRepository: InMemoryWorkspaceInviteRepository
let sut: InviteUserUseCase

describe('InviteUser', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    workspaceInviteRepository = new InMemoryWorkspaceInviteRepository()
    sut = new InviteUserUseCase(userRepository, workspaceInviteRepository)
  })

  it('should be able to invite a user to a workspace', async () => {
    const invitedUser = makeUser()
    await userRepository.create(invitedUser)

    const response = await sut.execute({
      email: invitedUser.email,
      inviterId: new UniqueEntityID().toString(),
      workspaceId: new UniqueEntityID().toString(),
      roleId: new UniqueEntityID().toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ workspaceInviteId: expect.any(String) })
  })

  it('should persist the invite in the repository with correct fields', async () => {
    const invitedUser = makeUser()
    await userRepository.create(invitedUser)

    const inviterId = new UniqueEntityID().toString()
    const workspaceId = new UniqueEntityID().toString()
    const roleId = new UniqueEntityID().toString()

    await sut.execute({
      email: invitedUser.email,
      inviterId,
      workspaceId,
      roleId,
    })

    expect(workspaceInviteRepository.items.length).toBe(1)
    expect(workspaceInviteRepository.items[0].invitedUserId).toBe(invitedUser.id.toString())
    expect(workspaceInviteRepository.items[0].invitedByUserId).toBe(inviterId)
    expect(workspaceInviteRepository.items[0].workspaceId).toBe(workspaceId)
    expect(workspaceInviteRepository.items[0].roleId).toBe(roleId)
  })

  it('should persist the invite with status pending', async () => {
    const invitedUser = makeUser()
    await userRepository.create(invitedUser)

    await sut.execute({
      email: invitedUser.email,
      inviterId: new UniqueEntityID().toString(),
      workspaceId: new UniqueEntityID().toString(),
      roleId: new UniqueEntityID().toString(),
    })

    expect(workspaceInviteRepository.items[0].status).toBe('pending')
  })

  it('should return the id matching the persisted invite', async () => {
    const invitedUser = makeUser()
    await userRepository.create(invitedUser)

    const response = await sut.execute({
      email: invitedUser.email,
      inviterId: new UniqueEntityID().toString(),
      workspaceId: new UniqueEntityID().toString(),
      roleId: new UniqueEntityID().toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toEqual({
      workspaceInviteId: workspaceInviteRepository.items[0].id.toString(),
    })
  })

  it('should return ResourceNotFoundError when no user is found for the given email', async () => {
    const response = await sut.execute({
      email: 'nonexistent@example.com',
      inviterId: new UniqueEntityID().toString(),
      workspaceId: new UniqueEntityID().toString(),
      roleId: new UniqueEntityID().toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
