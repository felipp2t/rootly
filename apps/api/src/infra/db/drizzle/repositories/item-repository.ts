import { eq, inArray } from 'drizzle-orm'
import type { ItemRepository } from '@/domain/root/application/repositories/item-repository.ts'
import type { Item } from '@/domain/root/enterprise/entities/item.ts'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleItemMapper } from '../mappers/drizzle-item-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleItemRepository implements ItemRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  private async loadTagIdsByItemIds(
    itemIds: string[],
  ): Promise<Record<string, string[]>> {
    if (itemIds.length === 0) return {}

    const rows = await this.db
      .select()
      .from(schema.itemTags)
      .where(inArray(schema.itemTags.itemId, itemIds))

    return rows.reduce<Record<string, string[]>>((acc, row) => {
      acc[row.itemId] = [...(acc[row.itemId] ?? []), row.tagId]
      return acc
    }, {})
  }

  async findById(id: string): Promise<Item | null> {
    const rows = await this.db
      .select()
      .from(schema.items)
      .where(eq(schema.items.id, id))

    if (rows.length === 0) return null

    const tagsByItem = await this.loadTagIdsByItemIds([id])

    return DrizzleItemMapper.toDomain(rows[0], tagsByItem[id] ?? [])
  }

  async findByTitle(title: string): Promise<Item | null> {
    const rows = await this.db
      .select()
      .from(schema.items)
      .where(eq(schema.items.title, title))

    if (rows.length === 0) return null

    const tagsByItem = await this.loadTagIdsByItemIds([rows[0].id])

    return DrizzleItemMapper.toDomain(rows[0], tagsByItem[rows[0].id] ?? [])
  }

  async findMany(parentId?: string): Promise<Item[]> {
    const rows = await this.db
      .select()
      .from(schema.items)
      .where(
        parentId !== undefined ? eq(schema.items.folderId, parentId) : undefined,
      )

    if (rows.length === 0) return []

    const tagsByItem = await this.loadTagIdsByItemIds(rows.map((r) => r.id))

    return rows.map((row) =>
      DrizzleItemMapper.toDomain(row, tagsByItem[row.id] ?? []),
    )
  }

  async create(item: Item): Promise<void> {
    await this.db.insert(schema.items).values(DrizzleItemMapper.toDrizzle(item))

    if (item.tagIds.length > 0) {
      await this.db.insert(schema.itemTags).values(
        item.tagIds.map((tagId) => ({
          itemId: item.id.toString(),
          tagId,
        })),
      )
    }
  }

  async save(item: Item): Promise<void> {
    await this.db
      .update(schema.items)
      .set(DrizzleItemMapper.toDrizzle(item))
      .where(eq(schema.items.id, item.id.toString()))

    await this.db
      .delete(schema.itemTags)
      .where(eq(schema.itemTags.itemId, item.id.toString()))

    if (item.tagIds.length > 0) {
      await this.db.insert(schema.itemTags).values(
        item.tagIds.map((tagId) => ({
          itemId: item.id.toString(),
          tagId,
        })),
      )
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.items).where(eq(schema.items.id, id))
  }
}
