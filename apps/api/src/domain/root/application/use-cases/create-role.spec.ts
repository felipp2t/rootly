import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { InMemoryWorkspaceRoleRepository } from '@test/repositories/in-memory-workspace-role-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { WorkspaceRole } from '../../enterprise/entities/workspace-role.ts'
import { CreateRoleUseCase } from './create-role.ts'
import { RoleAlreadyExistsError } from './errors/role-already-exists-error.ts'

let workspaceRepository: InMemoryWorkspaceRepository
let workspaceRoleRepository: InMemoryWorkspaceRoleRepository
let sut: CreateRoleUseCase

describe('CreateRole', () => {
  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository()
    workspaceRoleRepository = new InMemoryWorkspaceRoleRepository()
    sut = new CreateRoleUseCase(workspaceRoleRepository, workspaceRepository)
  })

  it('should be able to create a role', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: user.id.toString(),
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ roleId: expect.any(String) })
  })

  it('should persist the role with the correct name and workspaceId', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    await sut.execute({
      userId: user.id.toString(),
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })

    expect(workspaceRoleRepository.items.length).toBe(1)
    expect(workspaceRoleRepository.items[0].name).toBe('Developer')
    expect(workspaceRoleRepository.items[0].workspaceId).toBe(
      workspace.id.toString(),
    )
  })

  it('should return the id matching the persisted role', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: user.id.toString(),
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toEqual({
      roleId: workspaceRoleRepository.items[0].id.toString(),
    })
  })

  it('should return ResourceNotFoundError when the workspace does not exist', async () => {
    const response = await sut.execute({
      userId: makeUser().id.toString(),
      name: 'Developer',
      workspaceId: 'non-existent-workspace-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return RoleAlreadyExistsError when the name is a reserved role name', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: user.id.toString(),
      name: 'Owner',
      workspaceId: workspace.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(RoleAlreadyExistsError)
  })

  it('should return RoleAlreadyExistsError when a role with the same name already exists in the workspace', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const existingRole = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(existingRole)

    const response = await sut.execute({
      userId: user.id.toString(),
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(RoleAlreadyExistsError)
  })
})
