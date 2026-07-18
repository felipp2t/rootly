import {
  type Paginated,
  paginate,
  toPaginated,
} from '@/core/types/paginated.ts'
import type {
  FindManyItemsOptions,
  ItemRepository,
} from '@/domain/root/application/repositories/item-repository.ts'
import type { Item } from '@/domain/root/enterprise/entities/item.ts'

export class InMemoryItemRepository implements ItemRepository {
  items: Item[] = []
  workspaceMembers: { userId: string; workspaceId: string }[] = []

  async findById(id: string): Promise<Item | null> {
    return this.items.find((item) => item.id.toString() === id) ?? null
  }

  async findByTitle(title: string): Promise<Item | null> {
    return this.items.find((item) => item.title === title) ?? null
  }

  async findMany(
    userId: string,
    parentId?: string,
    workspaceId?: string,
    options?: FindManyItemsOptions,
  ): Promise<Paginated<Item>> {
    const userWorkspaceIds = this.workspaceMembers
      .filter((m) => m.userId === userId)
      .map((m) => m.workspaceId)

    const scoped = this.items.filter(
      (item) =>
        userWorkspaceIds.includes(item.workspaceId) &&
        (options?.includeArchived || !item.isArchived),
    )

    const filtered =
      workspaceId !== undefined
        ? scoped.filter(
            (item) =>
              item.workspaceId === workspaceId && item.folderId === undefined,
          )
        : parentId === undefined
          ? scoped
          : scoped.filter((item) => item.folderId === parentId)

    const { page, limit, offset } = paginate(options?.page, options?.limit)

    return toPaginated(
      filtered.slice(offset, offset + limit),
      filtered.length,
      page,
      limit,
    )
  }

  async hasItems(folderId: string): Promise<boolean> {
    return this.items.some((item) => item.folderId === folderId)
  }

  async create(item: Item): Promise<void> {
    this.items.push(item)
  }

  async save(item: Item): Promise<void> {
    const itemIndex = this.items.findIndex(
      (i) => i.id.toString() === item.id.toString(),
    )

    if (itemIndex !== -1) {
      this.items[itemIndex] = item
    }
  }

  async delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id.toString() === id)

    if (itemIndex !== -1) {
      this.items.splice(itemIndex, 1)
    }
  }
}
