import { makeTag } from '@test/factories/make-tag.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { InMemoryTagRepository } from './in-memory-tag-repository.ts'

describe('InMemoryTagRepository', () => {
  let repo: InMemoryTagRepository

  beforeEach(() => {
    repo = new InMemoryTagRepository()
  })

  describe('create', () => {
    it('should add a tag to items', async () => {
      const tag = makeTag({ workspaceId: 'ws-1' })
      await repo.create(tag)
      expect(repo.items).toHaveLength(1)
      expect(repo.items[0]).toBe(tag)
    })
  })

  describe('findById', () => {
    it('should return the tag when found', async () => {
      const id = new UniqueEntityID('tag-1')
      const tag = makeTag({ workspaceId: 'ws-1' }, id)
      await repo.create(tag)

      const result = await repo.findById('tag-1')

      expect(result).toBe(tag)
    })

    it('should return null when not found', async () => {
      const result = await repo.findById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('findByName', () => {
    it('should return the tag matching the name', async () => {
      const tag = makeTag({ workspaceId: 'ws-1', name: 'backend' })
      await repo.create(tag)

      const result = await repo.findByName('backend')

      expect(result).toBe(tag)
    })

    it('should return null when no tag matches the name', async () => {
      const tag = makeTag({ workspaceId: 'ws-1', name: 'backend' })
      await repo.create(tag)

      const result = await repo.findByName('frontend')

      expect(result).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should return all tags', async () => {
      const t1 = makeTag({ workspaceId: 'ws-1' })
      const t2 = makeTag({ workspaceId: 'ws-2' })
      await repo.create(t1)
      await repo.create(t2)

      const result = await repo.findAll()

      expect(result).toHaveLength(2)
      expect(result).toContain(t1)
      expect(result).toContain(t2)
    })

    it('should return empty array when there are no tags', async () => {
      const result = await repo.findAll()
      expect(result).toHaveLength(0)
    })
  })

  describe('delete', () => {
    it('should remove the tag by id', async () => {
      const id = new UniqueEntityID('tag-del')
      const tag = makeTag({ workspaceId: 'ws-1' }, id)
      await repo.create(tag)

      await repo.delete('tag-del')

      expect(repo.items).toHaveLength(0)
    })

    it('should do nothing when id does not exist', async () => {
      const tag = makeTag({ workspaceId: 'ws-1' })
      await repo.create(tag)

      await repo.delete('nonexistent')

      expect(repo.items).toHaveLength(1)
    })
  })
})
