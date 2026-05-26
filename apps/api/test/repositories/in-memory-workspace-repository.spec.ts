import { makeItem } from '@test/factories/make-item.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { makeWorkspaceMember } from '@test/factories/make-workspace-member.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { InMemoryItemRepository } from './in-memory-item-repository.ts'
import { InMemoryWorkspaceMemberRepository } from './in-memory-workspace-member-repository.ts'
import { InMemoryWorkspaceRepository } from './in-memory-workspace-repository.ts'

describe('InMemoryWorkspaceRepository', () => {
  let itemRepo: InMemoryItemRepository
  let memberRepo: InMemoryWorkspaceMemberRepository
  let repo: InMemoryWorkspaceRepository

  beforeEach(() => {
    itemRepo = new InMemoryItemRepository()
    memberRepo = new InMemoryWorkspaceMemberRepository()
    repo = new InMemoryWorkspaceRepository(itemRepo, memberRepo)
  })

  describe('create', () => {
    it('should add a workspace to items', async () => {
      const ws = makeWorkspace({ userId: 'u-1' })
      await repo.create(ws)
      expect(repo.items).toHaveLength(1)
      expect(repo.items[0]).toBe(ws)
    })
  })

  describe('findById', () => {
    it('should return the workspace when found for the correct user', async () => {
      const id = new UniqueEntityID('ws-1')
      const ws = makeWorkspace({ userId: 'u-1' }, id)
      await repo.create(ws)

      const result = await repo.findById('u-1', 'ws-1')

      expect(result).toBe(ws)
    })

    it('should return null when workspace belongs to a different user', async () => {
      const id = new UniqueEntityID('ws-1')
      const ws = makeWorkspace({ userId: 'u-1' }, id)
      await repo.create(ws)

      const result = await repo.findById('u-2', 'ws-1')

      expect(result).toBeNull()
    })

    it('should return null when id does not exist', async () => {
      const result = await repo.findById('u-1', 'nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('findByName', () => {
    it('should return the workspace matching the name', async () => {
      const ws = makeWorkspace({ userId: 'u-1', name: 'my-workspace' })
      await repo.create(ws)

      const result = await repo.findByName('my-workspace')

      expect(result).toBe(ws)
    })

    it('should return null when no workspace matches the name', async () => {
      const ws = makeWorkspace({ userId: 'u-1', name: 'my-workspace' })
      await repo.create(ws)

      const result = await repo.findByName('other')

      expect(result).toBeNull()
    })
  })

  describe('findMany', () => {
    it('should return all workspaces when called without userId', async () => {
      const ws1 = makeWorkspace({ userId: 'u-1' })
      const ws2 = makeWorkspace({ userId: 'u-2' })
      await repo.create(ws1)
      await repo.create(ws2)

      const result = await repo.findMany()

      expect(result).toHaveLength(2)
    })

    it('should filter by userId when provided', async () => {
      const ws1 = makeWorkspace({ userId: 'u-1' })
      const ws2 = makeWorkspace({ userId: 'u-2' })
      await repo.create(ws1)
      await repo.create(ws2)

      const result = await repo.findMany('u-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toBe(ws1)
    })

    it('should return empty array when user has no workspaces', async () => {
      const result = await repo.findMany('nobody')
      expect(result).toHaveLength(0)
    })
  })

  describe('delete', () => {
    it('should remove the workspace by id', async () => {
      const id = new UniqueEntityID('ws-del')
      const ws = makeWorkspace({ userId: 'u-1' }, id)
      await repo.create(ws)

      await repo.delete('ws-del')

      expect(repo.items).toHaveLength(0)
    })

    it('should do nothing when id does not exist', async () => {
      const ws = makeWorkspace({ userId: 'u-1' })
      await repo.create(ws)

      await repo.delete('nonexistent')

      expect(repo.items).toHaveLength(1)
    })
  })

  describe('findManyByIds', () => {
    it('should return workspaces matching the given ids', async () => {
      const id1 = new UniqueEntityID('ws-a')
      const id2 = new UniqueEntityID('ws-b')
      const ws1 = makeWorkspace({ userId: 'u-1' }, id1)
      const ws2 = makeWorkspace({ userId: 'u-1' }, id2)
      const ws3 = makeWorkspace({ userId: 'u-1' })
      await repo.create(ws1)
      await repo.create(ws2)
      await repo.create(ws3)

      const result = await repo.findManyByIds(['ws-a', 'ws-b'])

      expect(result).toHaveLength(2)
      expect(result.map((w) => w.id.toString())).toContain('ws-a')
      expect(result.map((w) => w.id.toString())).toContain('ws-b')
    })

    it('should compute itemCount from itemRepository', async () => {
      const id = new UniqueEntityID('ws-ic')
      const ws = makeWorkspace({ userId: 'u-1' }, id)
      await repo.create(ws)

      const item = makeItem({ workspaceId: 'ws-ic' })
      await itemRepo.create(item)

      const result = await repo.findManyByIds(['ws-ic'])

      expect(result[0].itemCount).toBe(1)
    })

    it('should compute memberCount from memberRepository', async () => {
      const id = new UniqueEntityID('ws-mc')
      const ws = makeWorkspace({ userId: 'u-1' }, id)
      await repo.create(ws)

      const member = makeWorkspaceMember({
        userId: 'u-1',
        workspaceId: 'ws-mc',
        roleId: 'r-1',
      })
      await memberRepo.create(member)

      const result = await repo.findManyByIds(['ws-mc'])

      expect(result[0].memberCount).toBe(1)
    })

    it('should return empty array when no ids match', async () => {
      const ws = makeWorkspace({ userId: 'u-1' })
      await repo.create(ws)

      const result = await repo.findManyByIds(['nonexistent'])

      expect(result).toHaveLength(0)
    })
  })
})
