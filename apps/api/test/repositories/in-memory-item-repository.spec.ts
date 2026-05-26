import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { makeItem } from 'test/factories/make-item.ts'
import { InMemoryItemRepository } from './in-memory-item-repository.ts'

describe('InMemoryItemRepository', () => {
  let repo: InMemoryItemRepository

  beforeEach(() => {
    repo = new InMemoryItemRepository()
  })

  describe('create', () => {
    it('should add an item to items', async () => {
      const item = makeItem({ workspaceId: 'ws-1' })
      await repo.create(item)
      expect(repo.items).toHaveLength(1)
      expect(repo.items[0]).toBe(item)
    })
  })

  describe('findById', () => {
    it('should return the item when found', async () => {
      const id = new UniqueEntityID('item-1')
      const item = makeItem({ workspaceId: 'ws-1' }, id)
      await repo.create(item)

      const result = await repo.findById('item-1')

      expect(result).toBe(item)
    })

    it('should return null when not found', async () => {
      const result = await repo.findById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('findByTitle', () => {
    it('should return the item matching the title', async () => {
      const item = makeItem({ workspaceId: 'ws-1', title: 'my-item' })
      await repo.create(item)

      const result = await repo.findByTitle('my-item')

      expect(result).toBe(item)
    })

    it('should return null when no item matches the title', async () => {
      const item = makeItem({ workspaceId: 'ws-1', title: 'my-item' })
      await repo.create(item)

      const result = await repo.findByTitle('other')

      expect(result).toBeNull()
    })
  })

  describe('findMany', () => {
    beforeEach(() => {
      repo.workspaceMembers = [{ userId: 'u-1', workspaceId: 'ws-1' }]
    })

    it('should return all items accessible to user when no parentId or workspaceId given', async () => {
      const i1 = makeItem({ workspaceId: 'ws-1' })
      const i2 = makeItem({ workspaceId: 'ws-2' })
      await repo.create(i1)
      await repo.create(i2)

      const result = await repo.findMany('u-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toBe(i1)
    })

    it('should return root items (no folderId) filtered by workspaceId', async () => {
      const root = makeItem({ workspaceId: 'ws-1' })
      const nested = makeItem({ workspaceId: 'ws-1', folderId: 'folder-x' })
      await repo.create(root)
      await repo.create(nested)

      const result = await repo.findMany('u-1', undefined, 'ws-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toBe(root)
    })

    it('should return items by folderId (parentId)', async () => {
      const i1 = makeItem({ workspaceId: 'ws-1', folderId: 'folder-a' })
      const i2 = makeItem({ workspaceId: 'ws-1', folderId: 'folder-a' })
      const i3 = makeItem({ workspaceId: 'ws-1', folderId: 'folder-b' })
      await repo.create(i1)
      await repo.create(i2)
      await repo.create(i3)

      const result = await repo.findMany('u-1', 'folder-a')

      expect(result).toHaveLength(2)
      expect(result).toContain(i1)
      expect(result).toContain(i2)
    })

    it('should return empty array when user is not a member of any workspace', async () => {
      const item = makeItem({ workspaceId: 'ws-1' })
      await repo.create(item)

      const result = await repo.findMany('unknown-user')

      expect(result).toHaveLength(0)
    })
  })

  describe('save', () => {
    it('should update an existing item', async () => {
      const id = new UniqueEntityID('item-save')
      const item = makeItem({ workspaceId: 'ws-1', title: 'old' }, id)
      await repo.create(item)

      item.title = 'new'
      await repo.save(item)

      expect(repo.items[0].title).toBe('new')
    })

    it('should do nothing when item does not exist', async () => {
      const item = makeItem({ workspaceId: 'ws-1' })
      await repo.save(item)
      expect(repo.items).toHaveLength(0)
    })
  })

  describe('delete', () => {
    it('should remove the item by id', async () => {
      const id = new UniqueEntityID('item-del')
      const item = makeItem({ workspaceId: 'ws-1' }, id)
      await repo.create(item)

      await repo.delete('item-del')

      expect(repo.items).toHaveLength(0)
    })

    it('should do nothing when id does not exist', async () => {
      const item = makeItem({ workspaceId: 'ws-1' })
      await repo.create(item)

      await repo.delete('nonexistent')

      expect(repo.items).toHaveLength(1)
    })
  })
})
