import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { makeWorkspaceMember } from 'test/factories/make-workspace-member.ts'
import { InMemoryWorkspaceMemberRepository } from './in-memory-workspace-member-repository.ts'

describe('InMemoryWorkspaceMemberRepository', () => {
  let repo: InMemoryWorkspaceMemberRepository

  beforeEach(() => {
    repo = new InMemoryWorkspaceMemberRepository()
  })

  describe('create', () => {
    it('should add a member to items', async () => {
      const member = makeWorkspaceMember({ userId: 'u-1', workspaceId: 'ws-1', roleId: 'r-1' })
      await repo.create(member)
      expect(repo.items).toHaveLength(1)
      expect(repo.items[0]).toBe(member)
    })
  })

  describe('findById', () => {
    it('should return the member when found', async () => {
      const id = new UniqueEntityID('m-1')
      const member = makeWorkspaceMember({ userId: 'u-1', workspaceId: 'ws-1', roleId: 'r-1' }, id)
      await repo.create(member)

      const result = await repo.findById('m-1')

      expect(result).toBe(member)
    })

    it('should return null when not found', async () => {
      const result = await repo.findById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('findByUserId', () => {
    it('should return all members for a given userId', async () => {
      const m1 = makeWorkspaceMember({ userId: 'u-1', workspaceId: 'ws-1', roleId: 'r-1' })
      const m2 = makeWorkspaceMember({ userId: 'u-1', workspaceId: 'ws-2', roleId: 'r-1' })
      const m3 = makeWorkspaceMember({ userId: 'u-2', workspaceId: 'ws-1', roleId: 'r-1' })
      await repo.create(m1)
      await repo.create(m2)
      await repo.create(m3)

      const result = await repo.findByUserId('u-1')

      expect(result).toHaveLength(2)
      expect(result).toContain(m1)
      expect(result).toContain(m2)
    })

    it('should return empty array when user has no members', async () => {
      const result = await repo.findByUserId('nobody')
      expect(result).toHaveLength(0)
    })
  })

  describe('delete', () => {
    it('should remove the member by id', async () => {
      const id = new UniqueEntityID('m-del')
      const member = makeWorkspaceMember({ userId: 'u-1', workspaceId: 'ws-1', roleId: 'r-1' }, id)
      await repo.create(member)

      await repo.delete('m-del')

      expect(repo.items).toHaveLength(0)
    })

    it('should do nothing when id does not exist', async () => {
      const member = makeWorkspaceMember({ userId: 'u-1', workspaceId: 'ws-1', roleId: 'r-1' })
      await repo.create(member)

      await repo.delete('nonexistent')

      expect(repo.items).toHaveLength(1)
    })
  })
})
