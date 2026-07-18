import type { Paginated } from '@/core/types/paginated.ts'
import type { Item } from '../../enterprise/entities/item.ts'

export interface FindManyItemsOptions {
  includeArchived?: boolean
  page?: number
  limit?: number
}

export abstract class ItemRepository {
  abstract findById(id: string): Promise<Item | null>
  abstract findByTitle(title: string): Promise<Item | null>
  abstract findMany(
    userId: string,
    parentId?: string,
    workspaceId?: string,
    options?: FindManyItemsOptions,
  ): Promise<Paginated<Item>>
  abstract hasItems(folderId: string): Promise<boolean>
  abstract create(item: Item): Promise<void>
  abstract save(item: Item): Promise<void>
  abstract delete(id: string): Promise<void>
}
