import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryRolePermissionRepository } from '@test/repositories/in-memory-role-permission.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { InMemoryWorkspaceRoleRepository } from '@test/repositories/in-memory-workspace-role-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { RolePermission } from '../../enterprise/entities/role-permission.ts'
import { WorkspaceRole } from '../../enterprise/entities/workspace-role.ts'
import { SetRolePermissionsUseCase } from './set-role-permissions.ts'

let rolePermissionRepository: InMemoryRolePermissionRepository
let workspaceRoleRepository: InMemoryWorkspaceRoleRepository
let workspaceRepository: InMemoryWorkspaceRepository
let sut: SetRolePermissionsUseCase

describe('SetRolePermissions', () => {
  beforeEach(() => {
    rolePermissionRepository = new InMemoryRolePermissionRepository()
    workspaceRoleRepository = new InMemoryWorkspaceRoleRepository()
    workspaceRepository = new InMemoryWorkspaceRepository()
    sut = new SetRolePermissionsUseCase(
      rolePermissionRepository,
      workspaceRoleRepository,
      workspaceRepository,
    )
  })

  it('should be able to set permissions for a role', {
    tags: ['set-role-permissions'],
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
      permissions: [
        { resource: 'folder', action: 'read' },
        { resource: 'item', action: 'create' },
      ],
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toBeNull()
    expect(rolePermissionRepository.items).toHaveLength(2)
  })

  it('should persist permissions with the correct roleId, resource and action', {
    tags: ['set-role-permissions'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: role.id.toString(),
      permissions: [{ resource: 'tag', action: 'delete' }],
    })

    expect(rolePermissionRepository.items[0].roleId).toBe(role.id.toString())
    expect(rolePermissionRepository.items[0].resource).toBe('tag')
    expect(rolePermissionRepository.items[0].action).toBe('delete')
  })

  it('should replace existing permissions (delete-then-insert)', {
    tags: ['set-role-permissions'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    const existing = RolePermission.create({
      roleId: role.id.toString(),
      resource: 'folder',
      action: 'read',
    })
    rolePermissionRepository.items.push(existing)

    await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: role.id.toString(),
      permissions: [{ resource: 'item', action: 'all' }],
    })

    expect(rolePermissionRepository.items).toHaveLength(1)
    expect(rolePermissionRepository.items[0].resource).toBe('item')
    expect(rolePermissionRepository.items[0].action).toBe('all')
  })

  it('should clear all permissions when an empty array is provided', {
    tags: ['set-role-permissions'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    rolePermissionRepository.items.push(
      RolePermission.create({
        roleId: role.id.toString(),
        resource: 'folder',
        action: 'read',
      }),
    )

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: role.id.toString(),
      permissions: [],
    })

    expect(response.isRight()).toBe(true)
    expect(rolePermissionRepository.items).toHaveLength(0)
  })

  it('should not affect permissions of other roles when setting permissions', {
    tags: ['set-role-permissions'],
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

    const permForB = RolePermission.create({
      roleId: roleB.id.toString(),
      resource: 'tag',
      action: 'read',
    })
    rolePermissionRepository.items.push(permForB)

    await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: roleA.id.toString(),
      permissions: [{ resource: 'folder', action: 'create' }],
    })

    const permissionsForB = rolePermissionRepository.items.filter(
      (p) => p.roleId === roleB.id.toString(),
    )
    expect(permissionsForB).toHaveLength(1)
    expect(permissionsForB[0].resource).toBe('tag')
  })

  it('should return ResourceNotFoundError when the workspace does not exist', {
    tags: ['set-role-permissions'],
  }, async () => {
    const response = await sut.execute({
      userId: makeUser().id.toString(),
      workspaceId: 'non-existent-workspace-id',
      roleId: 'any-role-id',
      permissions: [],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the workspace belongs to a different user', {
    tags: ['set-role-permissions'],
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
      permissions: [],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the role does not exist', {
    tags: ['set-role-permissions'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: 'non-existent-role-id',
      permissions: [],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the role belongs to a different workspace', {
    tags: ['set-role-permissions'],
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
      permissions: [{ resource: 'folder', action: 'read' }],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
