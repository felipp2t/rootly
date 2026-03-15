import { makeUser } from '@test/factories/make-user.ts'
import { InMemoryRolePermissionRepository } from '@test/repositories/in-memory-role-permission.ts'
import { InMemoryWorkspaceMemberRepository } from '@test/repositories/in-memory-workspace-member-repository.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { InMemoryWorkspaceRoleRepository } from '@test/repositories/in-memory-workspace-role-repository.ts'
import { permissionResource } from '../../enterprise/entities/role-permission.ts'
import { CreateWorkspaceUseCase } from './create-workspace.ts'

let workspaceRepository: InMemoryWorkspaceRepository
let workspaceMemberRepository: InMemoryWorkspaceMemberRepository
let rolePermissionRepository: InMemoryRolePermissionRepository
let workspaceRoleRepository: InMemoryWorkspaceRoleRepository
let sut: CreateWorkspaceUseCase

describe('CreateWorkspace', () => {
  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository()
    workspaceMemberRepository = new InMemoryWorkspaceMemberRepository()
    rolePermissionRepository = new InMemoryRolePermissionRepository()
    workspaceRoleRepository = new InMemoryWorkspaceRoleRepository()
    sut = new CreateWorkspaceUseCase(
      workspaceRepository,
      workspaceMemberRepository,
      workspaceRoleRepository,
      rolePermissionRepository,
    )
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

  it('should create an Owner role for the workspace', async () => {
    const user = makeUser()

    await sut.execute({
      name: 'My Workspace',
      userId: user.id.toString(),
    })

    expect(workspaceRoleRepository.items.length).toBe(1)
    expect(workspaceRoleRepository.items[0].name).toBe('Owner')
  })

  it('should associate the Owner role with the created workspace', async () => {
    const user = makeUser()

    await sut.execute({
      name: 'My Workspace',
      userId: user.id.toString(),
    })

    const workspace = workspaceRepository.items[0]
    const role = workspaceRoleRepository.items[0]

    expect(role.workspaceId).toBe(workspace.id.toString())
  })

  it('should create one permission per resource with action "all"', async () => {
    const user = makeUser()

    await sut.execute({
      name: 'My Workspace',
      userId: user.id.toString(),
    })

    expect(rolePermissionRepository.items.length).toBe(
      permissionResource.length,
    )

    for (const resource of permissionResource) {
      const permission = rolePermissionRepository.items.find(
        (p) => p.resource === resource,
      )
      expect(permission).toBeDefined()
      expect(permission?.action).toBe('all')
    }
  })

  it('should bind all permissions to the Owner role', async () => {
    const user = makeUser()

    await sut.execute({
      name: 'My Workspace',
      userId: user.id.toString(),
    })

    const role = workspaceRoleRepository.items[0]

    for (const permission of rolePermissionRepository.items) {
      expect(permission.roleId).toBe(role.id.toString())
    }
  })

  it('should create a workspace member for the creator', async () => {
    const user = makeUser()

    await sut.execute({
      name: 'My Workspace',
      userId: user.id.toString(),
    })

    expect(workspaceMemberRepository.items.length).toBe(1)
  })

  it('should associate the workspace member with the creator', async () => {
    const user = makeUser()

    await sut.execute({
      name: 'My Workspace',
      userId: user.id.toString(),
    })

    expect(workspaceMemberRepository.items[0].userId).toBe(user.id.toString())
  })

  it('should associate the workspace member with the created workspace', async () => {
    const user = makeUser()

    await sut.execute({
      name: 'My Workspace',
      userId: user.id.toString(),
    })

    const workspace = workspaceRepository.items[0]

    expect(workspaceMemberRepository.items[0].workspaceId).toBe(
      workspace.id.toString(),
    )
  })

  it('should assign the Owner role to the workspace member', async () => {
    const user = makeUser()

    await sut.execute({
      name: 'My Workspace',
      userId: user.id.toString(),
    })

    const role = workspaceRoleRepository.items[0]

    expect(workspaceMemberRepository.items[0].roleId).toBe(role.id.toString())
  })
})
