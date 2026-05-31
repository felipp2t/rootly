import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { DeleteWorkspaceUseCase } from './delete-workspace.ts'

let workspaceRepository: InMemoryWorkspaceRepository
let sut: DeleteWorkspaceUseCase

describe('DeleteWorkspace', () => {
  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository()
    sut = new DeleteWorkspaceUseCase(workspaceRepository)
  })

  it('should be able to delete a workspace as the owner', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toBeNull()
    expect(workspaceRepository.items).toHaveLength(0)
  })

  it('should return ResourceNotFoundError when the workspace does not exist', async () => {
    const response = await sut.execute({
      userId: makeUser().id.toString(),
      workspaceId: 'non-existent-workspace-id',
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
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    expect(workspaceRepository.items).toHaveLength(1)
  })
})
