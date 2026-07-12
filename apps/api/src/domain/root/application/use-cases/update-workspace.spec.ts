import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { UpdateWorkspaceUseCase } from './update-workspace.ts'

let workspaceRepository: InMemoryWorkspaceRepository
let sut: UpdateWorkspaceUseCase

describe('UpdateWorkspace', () => {
  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository()
    sut = new UpdateWorkspaceUseCase(workspaceRepository)
  })

  it('should be able to update the workspace name', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({
      userId: user.id.toString(),
      name: 'Old Name',
    })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      name: 'New Name',
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toBeNull()
    expect(workspaceRepository.items[0].name).toBe('New Name')
  })

  it('should return ResourceNotFoundError when the workspace does not exist', async () => {
    const response = await sut.execute({
      userId: makeUser().id.toString(),
      workspaceId: 'non-existent-workspace-id',
      name: 'New Name',
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
      name: 'New Name',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should tag the workspace-renamed event with the caller as actorId', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({
      userId: user.id.toString(),
      name: 'Old Name',
    })
    workspaceRepository.items.push(workspace)

    await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      name: 'New Name',
    })

    const event = workspace.domainEvents.at(-1)
    expect(event).toMatchObject({ actorId: user.id.toString() })
  })
})
