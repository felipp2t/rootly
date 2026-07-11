import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import {
  isPermissionAllowed,
  permissionAction,
  permissionResource,
  RolePermission,
} from './role-permission.ts'

describe('RolePermission', () => {
  it('should create a role permission with default timestamps', () => {
    const before = new Date()
    const permission = RolePermission.create({
      roleId: 'role-1',
      resource: 'workspace',
      action: 'all',
    })
    const after = new Date()

    expect(permission.roleId).toBe('role-1')
    expect(permission.resource).toBe('workspace')
    expect(permission.action).toBe('all')
    expect(permission.createdAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    )
    expect(permission.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    expect(permission.updatedAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    )
    expect(permission.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should create a role permission with explicit timestamps', () => {
    const createdAt = new Date('2024-01-01')
    const updatedAt = new Date('2024-01-02')

    const permission = RolePermission.create({
      roleId: 'role-1',
      resource: 'item',
      action: 'read',
      createdAt,
      updatedAt,
    })

    expect(permission.createdAt).toEqual(createdAt)
    expect(permission.updatedAt).toEqual(updatedAt)
  })

  it('should create a role permission with a provided id', () => {
    const id = new UniqueEntityID('perm-fixed-id')
    const permission = RolePermission.create(
      { roleId: 'role-1', resource: 'folder', action: 'create' },
      id,
    )

    expect(permission.id.toString()).toBe('perm-fixed-id')
  })

  it('should expose the permissionResource constant with all expected resources', () => {
    expect(permissionResource).toContain('workspace')
    expect(permissionResource).toContain('folder')
    expect(permissionResource).toContain('item')
    expect(permissionResource).toContain('member')
    expect(permissionResource).toContain('role')
    expect(permissionResource).toHaveLength(5)
  })

  it('should expose the permissionAction constant with all expected actions', () => {
    expect(permissionAction).toContain('create')
    expect(permissionAction).toContain('read')
    expect(permissionAction).toContain('update')
    expect(permissionAction).toContain('delete')
    expect(permissionAction).toContain('invite')
    expect(permissionAction).toContain('all')
    expect(permissionAction).toHaveLength(6)
  })

  it('should disallow workspace:create', () => {
    expect(isPermissionAllowed('workspace', 'create')).toBe(false)
  })

  it('should allow member:invite but disallow invite for every other resource', () => {
    expect(isPermissionAllowed('member', 'invite')).toBe(true)

    for (const resource of permissionResource) {
      if (resource === 'member') continue
      expect(isPermissionAllowed(resource, 'invite')).toBe(false)
    }
  })

  it('should support all resource and action combinations', () => {
    for (const resource of permissionResource) {
      for (const action of permissionAction) {
        const permission = RolePermission.create({
          roleId: 'role-1',
          resource,
          action,
        })
        expect(permission.resource).toBe(resource)
        expect(permission.action).toBe(action)
      }
    }
  })
})
