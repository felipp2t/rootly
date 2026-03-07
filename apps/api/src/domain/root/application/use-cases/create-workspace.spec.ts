import { makeUser } from '@test/factories/make-user.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { CreateWorkspaceUseCase } from './create-workspace.ts'

let workspaceRepository: InMemoryWorkspaceRepository
let sut: CreateWorkspaceUseCase

describe('CreateWorkspace', () => {
  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository()
    sut = new CreateWorkspaceUseCase(workspaceRepository)
  })

  it('should be able to create a workspace', async () => {
    const user = makeUser()

    const response = await sut.execute({
      name: 'My Workspace',
      userId: user.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ workspaceId: expect.any(String) })
  })

  it('should persist the workspace in the repository', async () => {
    const user = makeUser()

    await sut.execute({
      name: 'My Workspace',
      userId: user.id.toString(),
    })

    expect(workspaceRepository.items.length).toBe(1)
    expect(workspaceRepository.items[0].name).toBe('My Workspace')
    expect(workspaceRepository.items[0].userId).toBe(user.id.toString())
  })

  it('should return the id of the created workspace', async () => {
    const user = makeUser()

    const response = await sut.execute({
      name: 'My Workspace',
      userId: user.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toEqual({
      workspaceId: workspaceRepository.items[0].id.toString(),
    })
  })
})
