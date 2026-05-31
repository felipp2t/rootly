import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { makeWorkspaceMember } from '@test/factories/make-workspace-member.ts'
import { InMemoryRolePermissionRepository } from '@test/repositories/in-memory-role-permission.ts'
import { InMemoryWorkspaceMemberRepository } from '@test/repositories/in-memory-workspace-member-repository.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { RolePermission } from '../../enterprise/entities/role-permission.ts'
import { WorkspaceRole } from '../../enterprise/entities/workspace-role.ts'
import { GetMyWorkspacePermissionsUseCase } from './get-my-workspace-permissions.ts'

let workspaceRepository: InMemoryWorkspaceRepository
let workspaceMemberRepository: InMemoryWorkspaceMemberRepository
let rolePermissionRepository: InMemoryRolePermissionRepository
let sut: GetMyWorkspacePermissionsUseCase

describe('GetMyWorkspacePermissions', () => {
  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository()
    workspaceMemberRepository = new InMemoryWorkspaceMemberRepository()
    rolePermissionRepository = new InMemoryRolePermissionRepository()
    sut = new GetMyWorkspacePermissionsUseCase(
      workspaceRepository,
      workspaceMemberRepository,
      rolePermissionRepository,
    )
  })

  it('should return the permissions for a member with an assigned role', {
    tags: ['get-my-workspace-permissions'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })

    const member = makeWorkspaceMember({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: role.id.toString(),
    })
    workspaceMemberRepository.items.push(member)

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
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.permissions).toHaveLength(2)
      expect(response.value.permissions).toEqual(
        expect.arrayContaining([
          { resource: 'folder', action: 'read' },
          { resource: 'item', action: 'create' },
        ]),
      )
    }
  })

  it('should return ResourceNotFoundError when workspace does not exist', {
    tags: ['get-my-workspace-permissions'],
  }, async () => {
    const user = makeUser()

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: 'non-existent-workspace-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the workspace belongs to a different user', {
    tags: ['get-my-workspace-permissions'],
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

  it('should return empty permissions when the user is the owner with no member row', {
    tags: ['get-my-workspace-permissions'],
  }, async () => {
    const owner = makeUser()
    const workspace = makeWorkspace({ userId: owner.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: owner.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.permissions).toHaveLength(0)
    }
  })

  it('should return empty permissions when the member role has no permissions assigned', {
    tags: ['get-my-workspace-permissions'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Empty Role',
      workspaceId: workspace.id.toString(),
    })

    const member = makeWorkspaceMember({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: role.id.toString(),
    })
    workspaceMemberRepository.items.push(member)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.permissions).toHaveLength(0)
    }
  })
})
