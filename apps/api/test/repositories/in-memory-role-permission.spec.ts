import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { RolePermission } from '@/domain/root/enterprise/entities/role-permission.ts'
import { InMemoryRolePermissionRepository } from './in-memory-role-permission.ts'

function makeRolePermission(roleId: string, id?: UniqueEntityID) {
  return RolePermission.create(
    { roleId, resource: 'folder', action: 'read' },
    id,
  )
}

describe('InMemoryRolePermissionRepository', () => {
  let repo: InMemoryRolePermissionRepository

  beforeEach(() => {
    repo = new InMemoryRolePermissionRepository()
  })

  describe('create', () => {
    it('should add a role permission to items', async () => {
      const rp = makeRolePermission('role-1')
      await repo.create(rp)
      expect(repo.items).toHaveLength(1)
      expect(repo.items[0]).toBe(rp)
    })
  })

  describe('findById', () => {
    it('should return the role permission when found', async () => {
      const id = new UniqueEntityID('rp-1')
      const rp = makeRolePermission('role-1', id)
      await repo.create(rp)
      const result = await repo.findById('rp-1')
      expect(result).toBe(rp)
    })

    it('should return null when not found', async () => {
      const result = await repo.findById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('findByRoleId', () => {
    it('should return all permissions for a given roleId', async () => {
      const rp1 = makeRolePermission('role-a')
      const rp2 = makeRolePermission('role-a')
      const rp3 = makeRolePermission('role-b')
      await repo.create(rp1)
      await repo.create(rp2)
      await repo.create(rp3)

      const result = await repo.findByRoleId('role-a')

      expect(result).toHaveLength(2)
      expect(result).toContain(rp1)
      expect(result).toContain(rp2)
    })

    it('should return empty array when no permissions match', async () => {
      const rp = makeRolePermission('role-a')
      await repo.create(rp)

      const result = await repo.findByRoleId('role-z')

      expect(result).toHaveLength(0)
    })
  })

  describe('delete', () => {
    it('should remove the role permission by id', async () => {
      const id = new UniqueEntityID('rp-del')
      const rp = makeRolePermission('role-1', id)
      await repo.create(rp)

      await repo.delete('rp-del')

      expect(repo.items).toHaveLength(0)
    })

    it('should do nothing when id does not exist', async () => {
      const rp = makeRolePermission('role-1')
      await repo.create(rp)

      await repo.delete('nonexistent')

      expect(repo.items).toHaveLength(1)
    })
  })
})
