import type { Item } from '../../enterprise/entities/item.ts'

export abstract class ItemRepository {
  abstract findById(id: string): Promise<Item | null>
  abstract findByTitle(title: string): Promise<Item | null>
  abstract findManyByParentId(parentId: string | null): Promise<Item[]>
  abstract create(item: Item): Promise<void>
  abstract save(item: Item): Promise<void>
  abstract delete(id: string): Promise<void>
}
