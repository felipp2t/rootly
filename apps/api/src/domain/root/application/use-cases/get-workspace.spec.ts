import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { GetWorkspacesUseCase } from './get-workspace.ts'

let workspaceRepository: InMemoryWorkspaceRepository
let sut: GetWorkspacesUseCase

describe('GetWorkspacesUseCase', () => {
  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository()
    sut = new GetWorkspacesUseCase(workspaceRepository)
  })

  it('should return the workspace when it belongs to the user', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.workspace).toMatchObject({
        userId: user.id.toString(),
      })
      expect(response.value.workspace.id.toString()).toBe(workspace.id.toString())
    }
  })

  it('should return ResourceNotFoundError when workspace does not exist', async () => {
    const user = makeUser()

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: 'non-existent-id',
    })

    expect(response.isLeft()).toBe(true)
    if (response.isLeft()) {
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })

  it('should return ResourceNotFoundError when workspace belongs to a different user', async () => {
    const owner = makeUser()
    const otherUser = makeUser()
    const workspace = makeWorkspace({ userId: owner.id.toString() })

    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: otherUser.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    if (response.isLeft()) {
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
