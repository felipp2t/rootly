import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { makeFolder } from 'test/factories/make-folder.ts'
import { InMemoryFolderRepository } from './in-memory-folder-repository.ts'

describe('InMemoryFolderRepository', () => {
  let repo: InMemoryFolderRepository

  beforeEach(() => {
    repo = new InMemoryFolderRepository()
  })

  describe('create', () => {
    it('should add a folder to items', async () => {
      const folder = makeFolder({ workspaceId: 'ws-1' })
      await repo.create(folder)
      expect(repo.items).toHaveLength(1)
      expect(repo.items[0]).toBe(folder)
    })
  })

  describe('findById', () => {
    it('should return the folder when found', async () => {
      const id = new UniqueEntityID('f-1')
      const folder = makeFolder({ workspaceId: 'ws-1' }, id)
      await repo.create(folder)

      const result = await repo.findById('f-1')

      expect(result).toBe(folder)
    })

    it('should return null when not found', async () => {
      const result = await repo.findById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('findByName', () => {
    it('should return the folder matching the name', async () => {
      const folder = makeFolder({ workspaceId: 'ws-1', name: 'docs' })
      await repo.create(folder)

      const result = await repo.findByName('docs')

      expect(result).toBe(folder)
    })

    it('should return null when no folder matches the name', async () => {
      const folder = makeFolder({ workspaceId: 'ws-1', name: 'docs' })
      await repo.create(folder)

      const result = await repo.findByName('other')

      expect(result).toBeNull()
    })
  })

  describe('findByWorkspaceId', () => {
    it('should return folders for the given workspace', async () => {
      const f1 = makeFolder({ workspaceId: 'ws-1' })
      const f2 = makeFolder({ workspaceId: 'ws-1' })
      const f3 = makeFolder({ workspaceId: 'ws-2' })
      await repo.create(f1)
      await repo.create(f2)
      await repo.create(f3)

      const result = await repo.findByWorkspaceId('ws-1')

      expect(result).toHaveLength(2)
      expect(result).toContain(f1)
      expect(result).toContain(f2)
    })

    it('should return empty array when workspace has no folders', async () => {
      const result = await repo.findByWorkspaceId('ws-empty')
      expect(result).toHaveLength(0)
    })
  })

  describe('findMany', () => {
    beforeEach(() => {
      repo.workspaceMembers = [{ userId: 'u-1', workspaceId: 'ws-1' }]
    })

    it('should return all folders accessible to user when no parentId or workspaceId given', async () => {
      const f1 = makeFolder({ workspaceId: 'ws-1' })
      const f2 = makeFolder({ workspaceId: 'ws-2' })
      await repo.create(f1)
      await repo.create(f2)

      const result = await repo.findMany('u-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toBe(f1)
    })

    it('should return root folders (no parentId) filtered by workspaceId', async () => {
      const root = makeFolder({ workspaceId: 'ws-1' })
      const child = makeFolder({ workspaceId: 'ws-1', parentId: root.id.toString() })
      await repo.create(root)
      await repo.create(child)

      const result = await repo.findMany('u-1', undefined, 'ws-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toBe(root)
    })

    it('should return folders by parentId', async () => {
      const parent = makeFolder({ workspaceId: 'ws-1' })
      const child1 = makeFolder({ workspaceId: 'ws-1', parentId: parent.id.toString() })
      const child2 = makeFolder({ workspaceId: 'ws-1', parentId: parent.id.toString() })
      const other = makeFolder({ workspaceId: 'ws-1' })
      await repo.create(parent)
      await repo.create(child1)
      await repo.create(child2)
      await repo.create(other)

      const result = await repo.findMany('u-1', parent.id.toString())

      expect(result).toHaveLength(2)
      expect(result).toContain(child1)
      expect(result).toContain(child2)
    })

    it('should return empty array when user is not a member of any workspace', async () => {
      const folder = makeFolder({ workspaceId: 'ws-1' })
      await repo.create(folder)

      const result = await repo.findMany('unknown-user')

      expect(result).toHaveLength(0)
    })
  })

  describe('save', () => {
    it('should update an existing folder', async () => {
      const id = new UniqueEntityID('f-save')
      const folder = makeFolder({ workspaceId: 'ws-1', name: 'old' }, id)
      await repo.create(folder)

      folder.name = 'new'
      await repo.save(folder)

      expect(repo.items[0].name).toBe('new')
    })

    it('should do nothing when folder does not exist', async () => {
      const folder = makeFolder({ workspaceId: 'ws-1' })
      await repo.save(folder)
      expect(repo.items).toHaveLength(0)
    })
  })

  describe('delete', () => {
    it('should remove the folder by id', async () => {
      const id = new UniqueEntityID('f-del')
      const folder = makeFolder({ workspaceId: 'ws-1' }, id)
      await repo.create(folder)

      await repo.delete('f-del')

      expect(repo.items).toHaveLength(0)
    })

    it('should do nothing when id does not exist', async () => {
      const folder = makeFolder({ workspaceId: 'ws-1' })
      await repo.create(folder)

      await repo.delete('nonexistent')

      expect(repo.items).toHaveLength(1)
    })
  })
})
