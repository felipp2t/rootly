import type { TagRepository } from '@/domain/root/application/repositories/tag-repository.ts'
import type { Tag } from '@/domain/root/enterprise/entities/tag.ts'

export class InMemoryTagRepository implements TagRepository {
  items: Tag[] = []

  async findById(id: string): Promise<Tag | null> {
    return this.items.find((tag) => tag.id.toString() === id) ?? null
  }

  async findByName(name: string): Promise<Tag | null> {
    return this.items.find((tag) => tag.name === name) ?? null
  }

  async findAll(): Promise<Tag[]> {
    return this.items
  }

  async create(tag: Tag): Promise<void> {
    this.items.push(tag)
  }

  async delete(id: string): Promise<void> {
    const tagIndex = this.items.findIndex((tag) => tag.id.toString() === id)

    if (tagIndex !== -1) {
      this.items.splice(tagIndex, 1)
    }
  }
}
