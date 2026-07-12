import { and, count, eq, isNull } from 'drizzle-orm'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { DomainEvents } from '@/core/events/domain-events.ts'
import type {
  FindManyItemsOptions,
  ItemRepository,
} from '@/domain/root/application/repositories/item-repository.ts'
import type { Item } from '@/domain/root/enterprise/entities/item.ts'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleItemMapper } from '../mappers/drizzle-item-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleItemRepository implements ItemRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: string): Promise<Item | null> {
    const rows = await this.db
      .select()
      .from(schema.items)
      .where(eq(schema.items.id, id))

    if (rows.length === 0) return null

    return DrizzleItemMapper.toDomain(rows[0])
  }

  async findByTitle(title: string): Promise<Item | null> {
    const rows = await this.db
      .select()
      .from(schema.items)
      .where(eq(schema.items.title, title))

    if (rows.length === 0) return null

    return DrizzleItemMapper.toDomain(rows[0])
  }

  async findMany(
    userId: string,
    parentId?: string,
    workspaceId?: string,
    options?: FindManyItemsOptions,
  ): Promise<Item[]> {
    const scopeCondition =
      parentId !== undefined
        ? eq(schema.items.folderId, parentId)
        : workspaceId !== undefined
          ? and(
              eq(schema.items.workspaceId, workspaceId),
              isNull(schema.items.folderId),
            )
          : undefined

    const archivedCondition = options?.includeArchived
      ? undefined
      : isNull(schema.items.archivedAt)

    const rows = await this.db
      .selectDistinct({ item: schema.items })
      .from(schema.items)
      .innerJoin(
        schema.workspaceMembers,
        and(
          eq(schema.workspaceMembers.workspaceId, schema.items.workspaceId),
          eq(schema.workspaceMembers.userId, userId),
        ),
      )
      .where(
        scopeCondition && archivedCondition
          ? and(scopeCondition, archivedCondition)
          : (scopeCondition ?? archivedCondition),
      )

    return rows.map((row) => DrizzleItemMapper.toDomain(row.item))
  }

  async hasItems(folderId: string): Promise<boolean> {
    const [result] = await this.db
      .select({ total: count() })
      .from(schema.items)
      .where(eq(schema.items.folderId, folderId))

    return (result?.total ?? 0) > 0
  }

  async create(item: Item): Promise<void> {
    await this.db.insert(schema.items).values(DrizzleItemMapper.toDrizzle(item))

    DomainEvents.dispatchEventsForAggregate(item.id)
  }

  async save(item: Item): Promise<void> {
    await this.db
      .update(schema.items)
      .set(DrizzleItemMapper.toDrizzle(item))
      .where(eq(schema.items.id, item.id.toString()))

    DomainEvents.dispatchEventsForAggregate(item.id)
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.items).where(eq(schema.items.id, id))

    DomainEvents.dispatchEventsForAggregate(new UniqueEntityID(id))
  }
}
