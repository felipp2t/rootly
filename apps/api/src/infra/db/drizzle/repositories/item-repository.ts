import { eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { ItemRepository } from '@/domain/root/application/repositories/item-repository.ts'
import type { Item } from '@/domain/root/enterprise/entities/item.ts'
import { DrizzleItemMapper } from '../mappers/drizzle-item-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleItemRepository implements ItemRepository {
  constructor(private readonly db: NodePgDatabase) {}

  async findById(id: string): Promise<Item | null> {
    const items = await this.db
      .select()
      .from(schema.items)
      .where(eq(schema.items.id, id))

    if (items.length === 0) {
      return null
    }

    return DrizzleItemMapper.toDomain(items[0])
  }

  async findByTitle(title: string): Promise<Item | null> {
    const items = await this.db
      .select()
      .from(schema.items)
      .where(eq(schema.items.title, title))

    if (items.length === 0) {
      return null
    }

    return DrizzleItemMapper.toDomain(items[0])
  }

  async findAll(): Promise<Item[]> {
    const items = await this.db.select().from(schema.items)

    return items.map(DrizzleItemMapper.toDomain)
  }

  async save(item: Item): Promise<void> {
    await this.db.insert(schema.items).values(DrizzleItemMapper.toDrizzle(item))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.items).where(eq(schema.items.id, id))
  }
}
