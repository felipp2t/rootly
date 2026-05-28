import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryRolePermissionRepository } from '@test/repositories/in-memory-role-permission.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { InMemoryWorkspaceRoleRepository } from '@test/repositories/in-memory-workspace-role-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { RolePermission } from '../../enterprise/entities/role-permission.ts'
import { WorkspaceRole } from '../../enterprise/entities/workspace-role.ts'
import { GetRolePermissionsUseCase } from './get-role-permissions.ts'

let rolePermissionRepository: InMemoryRolePermissionRepository
let workspaceRoleRepository: InMemoryWorkspaceRoleRepository
let workspaceRepository: InMemoryWorkspaceRepository
let sut: GetRolePermissionsUseCase

describe('GetRolePermissions', () => {
  beforeEach(() => {
    rolePermissionRepository = new InMemoryRolePermissionRepository()
    workspaceRoleRepository = new InMemoryWorkspaceRoleRepository()
    workspaceRepository = new InMemoryWorkspaceRepository()
    sut = new GetRolePermissionsUseCase(
      rolePermissionRepository,
      workspaceRoleRepository,
      workspaceRepository,
    )
  })

  it('should be able to get permissions for a role', {
    tags: ['get-role-permissions'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    const permA = RolePermission.create({
      roleId: role.id.toString(),
      resource: 'folder',
      action: 'read',
    })
    const permB = RolePermission.create({
      roleId: role.id.toString(),
      resource: 'item',
      action: 'create',
    })
    rolePermissionRepository.items.push(permA, permB)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: role.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.permissions).toHaveLength(2)
    }
  })

  it('should return an empty array when the role has no permissions', {
    tags: ['get-role-permissions'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: role.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.permissions).toHaveLength(0)
    }
  })

  it('should only return permissions belonging to the requested role', {
    tags: ['get-role-permissions'],
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

    const permForA = RolePermission.create({
      roleId: roleA.id.toString(),
      resource: 'folder',
      action: 'read',
    })
    const permForB = RolePermission.create({
      roleId: roleB.id.toString(),
      resource: 'item',
      action: 'create',
    })
    rolePermissionRepository.items.push(permForA, permForB)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: roleA.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.permissions).toHaveLength(1)
      expect(response.value.permissions[0].resource).toBe('folder')
    }
  })

  it('should return ResourceNotFoundError when the workspace does not exist', {
    tags: ['get-role-permissions'],
  }, async () => {
    const response = await sut.execute({
      userId: makeUser().id.toString(),
      workspaceId: 'non-existent-workspace-id',
      roleId: 'any-role-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the workspace belongs to a different user', {
    tags: ['get-role-permissions'],
  }, async () => {
    const owner = makeUser()
    const other = makeUser()
    const workspace = makeWorkspace({ userId: owner.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    const response = await sut.execute({
      userId: other.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: role.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the role does not exist', {
    tags: ['get-role-permissions'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: 'non-existent-role-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the role belongs to a different workspace', {
    tags: ['get-role-permissions'],
  }, async () => {
    const user = makeUser()
    const workspaceA = makeWorkspace({ userId: user.id.toString() })
    const workspaceB = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspaceA, workspaceB)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspaceB.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspaceA.id.toString(),
      roleId: role.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
