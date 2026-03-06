import type { TagRepository } from '@/domain/root/application/repositories/tag-repository.ts'
import type { Tag } from '@/domain/root/enterprise/entities/tag.ts'

export class InMemoryTagRepository implements TagRepository {
  tags: Tag[] = []

  async findById(id: string): Promise<Tag | null> {
    return this.tags.find((tag) => tag.id.toString() === id) ?? null
  }

  async findByName(name: string): Promise<Tag | null> {
    return this.tags.find((tag) => tag.name === name) ?? null
  }

  async findAll(): Promise<Tag[]> {
    return this.tags
  }

  async save(tag: Tag): Promise<void> {
    this.tags.push(tag)
  }

  async delete(id: string): Promise<void> {
    const tagIndex = this.tags.findIndex((tag) => tag.id.toString() === id)

    if (tagIndex !== -1) {
      this.tags.splice(tagIndex, 1)
    }
  }
}
