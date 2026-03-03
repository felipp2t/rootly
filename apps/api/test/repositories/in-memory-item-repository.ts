import type { ItemRepository } from '@/domain/root/application/repositories/item-repository.ts'
import type { Item } from '@/domain/root/enterprise/entities/item.ts'

export class InMemoryItemRepository implements ItemRepository {
  items: Item[] = []

  async findById(id: string): Promise<Item | null> {
    return this.items.find((item) => item.id.toString() === id) ?? null
  }

  async findByTitle(title: string): Promise<Item | null> {
    return this.items.find((item) => item.title === title) ?? null
  }

  async findAll(): Promise<Item[]> {
    return this.items
  }

  async save(item: Item): Promise<void> {
    this.items.push(item)
  }

  async delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id.toString() === id)

    if (itemIndex !== -1) {
      this.items.splice(itemIndex, 1)
    }
  }
}
