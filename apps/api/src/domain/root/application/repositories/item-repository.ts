import type { Item } from '../../enterprise/entities/item.ts'

export abstract class ItemRepository {
  abstract findById(id: string): Promise<Item | null>
  abstract findByTitle(title: string): Promise<Item | null>
  abstract findAll(): Promise<Item[]>
  abstract save(item: Item): Promise<void>
  abstract update(item: Item): Promise<void>
  abstract delete(id: string): Promise<void>
}
