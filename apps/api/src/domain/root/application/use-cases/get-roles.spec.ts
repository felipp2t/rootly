import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { InMemoryWorkspaceRoleRepository } from '@test/repositories/in-memory-workspace-role-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { WorkspaceRole } from '../../enterprise/entities/workspace-role.ts'
import { GetRolesUseCase } from './get-roles.ts'

let workspaceRepository: InMemoryWorkspaceRepository
let workspaceRoleRepository: InMemoryWorkspaceRoleRepository
let sut: GetRolesUseCase

describe('GetRoles', () => {
  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository()
    workspaceRoleRepository = new InMemoryWorkspaceRoleRepository()
    sut = new GetRolesUseCase(workspaceRoleRepository, workspaceRepository)
  })

  it('should be able to get roles for a workspace', {
    tags: ['get-roles'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const roleA = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    const roleB = WorkspaceRole.create({
      name: 'Designer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(roleA, roleB)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.roles).toHaveLength(2)
    }
  })

  it('should return an empty array when the workspace has no roles', {
    tags: ['get-roles'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.roles).toHaveLength(0)
    }
  })

  it('should only return roles belonging to the requested workspace', {
    tags: ['get-roles'],
  }, async () => {
    const user = makeUser()
    const workspaceA = makeWorkspace({ userId: user.id.toString() })
    const workspaceB = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspaceA, workspaceB)

    const roleA = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspaceA.id.toString(),
    })
    const roleB = WorkspaceRole.create({
      name: 'Designer',
      workspaceId: workspaceB.id.toString(),
    })
    workspaceRoleRepository.items.push(roleA, roleB)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspaceA.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.roles).toHaveLength(1)
      expect(response.value.roles[0].name).toBe('Developer')
    }
  })

  it('should return ResourceNotFoundError when the workspace does not exist', {
    tags: ['get-roles'],
  }, async () => {
    const response = await sut.execute({
      userId: makeUser().id.toString(),
      workspaceId: 'non-existent-workspace-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the workspace belongs to a different user', {
    tags: ['get-roles'],
  }, async () => {
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
  })
})
