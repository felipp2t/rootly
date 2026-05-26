import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { WorkspaceRole } from '@/domain/root/enterprise/entities/workspace-role.ts'
import { InMemoryWorkspaceRoleRepository } from './in-memory-workspace-role-repository.ts'

function makeWorkspaceRole(
  workspaceId: string,
  name: string,
  id?: UniqueEntityID,
) {
  return WorkspaceRole.create({ workspaceId, name }, id)
}

describe('InMemoryWorkspaceRoleRepository', () => {
  let repo: InMemoryWorkspaceRoleRepository

  beforeEach(() => {
    repo = new InMemoryWorkspaceRoleRepository()
  })

  describe('create', () => {
    it('should add a workspace role to items', async () => {
      const role = makeWorkspaceRole('ws-1', 'admin')
      await repo.create(role)
      expect(repo.items).toHaveLength(1)
      expect(repo.items[0]).toBe(role)
    })
  })

  describe('findById', () => {
    it('should return the role when found', async () => {
      const id = new UniqueEntityID('role-1')
      const role = makeWorkspaceRole('ws-1', 'admin', id)
      await repo.create(role)

      const result = await repo.findById('role-1')

      expect(result).toBe(role)
    })

    it('should return null when not found', async () => {
      const result = await repo.findById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('findByWorkspaceId', () => {
    it('should return all roles for a workspace', async () => {
      const r1 = makeWorkspaceRole('ws-1', 'admin')
      const r2 = makeWorkspaceRole('ws-1', 'member')
      const r3 = makeWorkspaceRole('ws-2', 'admin')
      await repo.create(r1)
      await repo.create(r2)
      await repo.create(r3)

      const result = await repo.findByWorkspaceId('ws-1')

      expect(result).toHaveLength(2)
      expect(result).toContain(r1)
      expect(result).toContain(r2)
    })

    it('should return empty array when workspace has no roles', async () => {
      const result = await repo.findByWorkspaceId('ws-empty')
      expect(result).toHaveLength(0)
    })
  })

  describe('findByWorkspaceIdAndName', () => {
    it('should return the role matching workspace and name', async () => {
      const role = makeWorkspaceRole('ws-1', 'admin')
      await repo.create(role)

      const result = await repo.findByWorkspaceIdAndName('ws-1', 'admin')

      expect(result).toBe(role)
    })

    it('should return null when name does not match', async () => {
      const role = makeWorkspaceRole('ws-1', 'admin')
      await repo.create(role)

      const result = await repo.findByWorkspaceIdAndName('ws-1', 'member')

      expect(result).toBeNull()
    })

    it('should return null when workspaceId does not match', async () => {
      const role = makeWorkspaceRole('ws-1', 'admin')
      await repo.create(role)

      const result = await repo.findByWorkspaceIdAndName('ws-2', 'admin')

      expect(result).toBeNull()
    })
  })

  describe('findMany', () => {
    it('should return all roles when called without name', async () => {
      const r1 = makeWorkspaceRole('ws-1', 'admin')
      const r2 = makeWorkspaceRole('ws-2', 'member')
      await repo.create(r1)
      await repo.create(r2)

      const result = await repo.findMany()

      expect(result).toHaveLength(2)
    })

    it('should filter by name when provided', async () => {
      const r1 = makeWorkspaceRole('ws-1', 'admin')
      const r2 = makeWorkspaceRole('ws-2', 'admin')
      const r3 = makeWorkspaceRole('ws-3', 'member')
      await repo.create(r1)
      await repo.create(r2)
      await repo.create(r3)

      const result = await repo.findMany('admin')

      expect(result).toHaveLength(2)
      expect(result).toContain(r1)
      expect(result).toContain(r2)
    })

    it('should return empty array when no roles match the name', async () => {
      const role = makeWorkspaceRole('ws-1', 'admin')
      await repo.create(role)

      const result = await repo.findMany('nonexistent')

      expect(result).toHaveLength(0)
    })
  })

  describe('delete', () => {
    it('should remove the role by id', async () => {
      const id = new UniqueEntityID('role-del')
      const role = makeWorkspaceRole('ws-1', 'admin', id)
      await repo.create(role)

      await repo.delete('role-del')

      expect(repo.items).toHaveLength(0)
    })

    it('should do nothing when id does not exist', async () => {
      const role = makeWorkspaceRole('ws-1', 'admin')
      await repo.create(role)

      await repo.delete('nonexistent')

      expect(repo.items).toHaveLength(1)
    })
  })
})
