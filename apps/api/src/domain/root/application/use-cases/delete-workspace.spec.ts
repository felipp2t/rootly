import { FakeHasher } from '@test/cryptography/faker-hasher.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { makeWorkspaceMember } from '@test/factories/make-workspace-member.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { InMemoryWorkspaceMemberRepository } from '@test/repositories/in-memory-workspace-member-repository.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { DeleteWorkspaceUseCase } from './delete-workspace.ts'
import { WrongCredentialsError } from './errors/wrong-credencials-error.ts'

let workspaceRepository: InMemoryWorkspaceRepository
let userRepository: InMemoryUserRepository
let fakeHasher: FakeHasher
let sut: DeleteWorkspaceUseCase

describe('DeleteWorkspace', () => {
  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository()
    userRepository = new InMemoryUserRepository()
    fakeHasher = new FakeHasher()
    sut = new DeleteWorkspaceUseCase(
      workspaceRepository,
      userRepository,
      fakeHasher,
    )
  })

  it('should be able to delete a workspace as the owner with the correct password', async () => {
    const user = makeUser({ passwordHash: await fakeHasher.hash('123456') })
    userRepository.items.push(user)
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      password: '123456',
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toBeNull()
    expect(workspaceRepository.items).toHaveLength(0)
  })

  it('should return WrongCredentialsError when the password is incorrect', async () => {
    const user = makeUser({ passwordHash: await fakeHasher.hash('123456') })
    userRepository.items.push(user)
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      password: 'wrong-password',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(WrongCredentialsError)
    expect(workspaceRepository.items).toHaveLength(1)
  })

  it('should return ResourceNotFoundError when the workspace does not exist', async () => {
    const response = await sut.execute({
      userId: makeUser().id.toString(),
      workspaceId: 'non-existent-workspace-id',
      password: '123456',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the workspace belongs to a different user', async () => {
    const owner = makeUser()
    const other = makeUser()
    const workspace = makeWorkspace({ userId: owner.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: other.id.toString(),
      workspaceId: workspace.id.toString(),
      password: '123456',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    expect(workspaceRepository.items).toHaveLength(1)
  })

  it('should return NotAllowedError when a non-owner member tries to delete the workspace', async () => {
    const owner = makeUser()
    const member = makeUser()
    userRepository.items.push(owner, member)

    const workspace = makeWorkspace({ userId: owner.id.toString() })
    const memberWorkspaceRepository = new InMemoryWorkspaceMemberRepository()
    memberWorkspaceRepository.items.push(
      makeWorkspaceMember({
        userId: member.id.toString(),
        workspaceId: workspace.id.toString(),
        roleId: new UniqueEntityID().toString(),
      }),
    )
    const scopedWorkspaceRepository = new InMemoryWorkspaceRepository(
      undefined,
      memberWorkspaceRepository,
    )
    scopedWorkspaceRepository.items.push(workspace)

    const scopedSut = new DeleteWorkspaceUseCase(
      scopedWorkspaceRepository,
      userRepository,
      fakeHasher,
    )

    const response = await scopedSut.execute({
      userId: member.id.toString(),
      workspaceId: workspace.id.toString(),
      password: '123456',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(NotAllowedError)
    expect(scopedWorkspaceRepository.items).toHaveLength(1)
  })

  it('should return ResourceNotFoundError(User) when the owner user record is missing', async () => {
    const ownerId = new UniqueEntityID().toString()
    const workspace = makeWorkspace({ userId: ownerId })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: ownerId,
      workspaceId: workspace.id.toString(),
      password: '123456',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    expect(workspaceRepository.items).toHaveLength(1)
  })
})
