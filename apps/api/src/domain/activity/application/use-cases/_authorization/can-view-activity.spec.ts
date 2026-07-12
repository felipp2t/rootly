import { makeWorkspaceMember } from '@test/factories/make-workspace-member.ts'
import { InMemoryRolePermissionRepository } from '@test/repositories/in-memory-role-permission.ts'
import { InMemoryWorkspaceMemberRepository } from '@test/repositories/in-memory-workspace-member-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { RolePermission } from '@/domain/root/enterprise/entities/role-permission.ts'
import { canViewActivity } from './can-view-activity.ts'

let workspaceMemberRepository: InMemoryWorkspaceMemberRepository
let rolePermissionRepository: InMemoryRolePermissionRepository

describe('CanViewActivity', () => {
  beforeEach(() => {
    workspaceMemberRepository = new InMemoryWorkspaceMemberRepository()
    rolePermissionRepository = new InMemoryRolePermissionRepository()
  })

  it('should allow the workspace owner without checking membership', async () => {
    const userId = new UniqueEntityID().toString()
    const workspaceId = new UniqueEntityID().toString()

    const allowed = await canViewActivity(
      { userId, workspaceId, ownerId: userId },
      workspaceMemberRepository,
      rolePermissionRepository,
    )

    expect(allowed).toBe(true)
    expect(workspaceMemberRepository.items).toHaveLength(0)
  })

  it('should not allow a non-owner with no membership record', async () => {
    const userId = new UniqueEntityID().toString()
    const workspaceId = new UniqueEntityID().toString()
    const ownerId = new UniqueEntityID().toString()

    const allowed = await canViewActivity(
      { userId, workspaceId, ownerId },
      workspaceMemberRepository,
      rolePermissionRepository,
    )

    expect(allowed).toBe(false)
  })

  it('should allow a non-owner member with activity:read permission', async () => {
    const userId = new UniqueEntityID().toString()
    const workspaceId = new UniqueEntityID().toString()
    const ownerId = new UniqueEntityID().toString()
    const roleId = new UniqueEntityID().toString()

    workspaceMemberRepository.items.push(
      makeWorkspaceMember({ userId, workspaceId, roleId }),
    )
    rolePermissionRepository.items.push(
      RolePermission.create({ roleId, resource: 'activity', action: 'read' }),
    )

    const allowed = await canViewActivity(
      { userId, workspaceId, ownerId },
      workspaceMemberRepository,
      rolePermissionRepository,
    )

    expect(allowed).toBe(true)
  })

  it('should allow a non-owner member with activity:all permission', async () => {
    const userId = new UniqueEntityID().toString()
    const workspaceId = new UniqueEntityID().toString()
    const ownerId = new UniqueEntityID().toString()
    const roleId = new UniqueEntityID().toString()

    workspaceMemberRepository.items.push(
      makeWorkspaceMember({ userId, workspaceId, roleId }),
    )
    rolePermissionRepository.items.push(
      RolePermission.create({ roleId, resource: 'activity', action: 'all' }),
    )

    const allowed = await canViewActivity(
      { userId, workspaceId, ownerId },
      workspaceMemberRepository,
      rolePermissionRepository,
    )

    expect(allowed).toBe(true)
  })

  it('should not allow a non-owner member with unrelated permissions', async () => {
    const userId = new UniqueEntityID().toString()
    const workspaceId = new UniqueEntityID().toString()
    const ownerId = new UniqueEntityID().toString()
    const roleId = new UniqueEntityID().toString()

    workspaceMemberRepository.items.push(
      makeWorkspaceMember({ userId, workspaceId, roleId }),
    )
    rolePermissionRepository.items.push(
      RolePermission.create({ roleId, resource: 'folder', action: 'read' }),
    )

    const allowed = await canViewActivity(
      { userId, workspaceId, ownerId },
      workspaceMemberRepository,
      rolePermissionRepository,
    )

    expect(allowed).toBe(false)
  })

  it('should not allow a non-owner member with zero permissions', async () => {
    const userId = new UniqueEntityID().toString()
    const workspaceId = new UniqueEntityID().toString()
    const ownerId = new UniqueEntityID().toString()
    const roleId = new UniqueEntityID().toString()

    workspaceMemberRepository.items.push(
      makeWorkspaceMember({ userId, workspaceId, roleId }),
    )

    const allowed = await canViewActivity(
      { userId, workspaceId, ownerId },
      workspaceMemberRepository,
      rolePermissionRepository,
    )

    expect(allowed).toBe(false)
  })
})
