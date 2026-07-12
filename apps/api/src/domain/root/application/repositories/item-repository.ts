import type { Item } from '../../enterprise/entities/item.ts'

export interface FindManyItemsOptions {
  includeArchived?: boolean
}

export abstract class ItemRepository {
  abstract findById(id: string): Promise<Item | null>
  abstract findByTitle(title: string): Promise<Item | null>
  abstract findMany(
    userId: string,
    parentId?: string,
    workspaceId?: string,
    options?: FindManyItemsOptions,
  ): Promise<Item[]>
  abstract hasItems(folderId: string): Promise<boolean>
  abstract create(item: Item): Promise<void>
  abstract save(item: Item): Promise<void>
  abstract delete(id: string): Promise<void>
}
