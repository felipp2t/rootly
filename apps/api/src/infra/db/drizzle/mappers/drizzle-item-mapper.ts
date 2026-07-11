import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { Item } from '@/domain/root/enterprise/entities/item.ts'
import type { schema } from '../schema/index.ts'

type DrizzleItem = InferSelectModel<typeof schema.items>
type DrizzleItemInsert = InferInsertModel<typeof schema.items>

export class DrizzleItemMapper {
  static toDomain(raw: DrizzleItem): Item {
    return Item.create(
      {
        workspaceId: raw.workspaceId,
        folderId: raw.folderId ?? undefined,
        title: raw.title,
        type: raw.type,
        content: raw.content ?? undefined,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ?? undefined,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toDrizzle(item: Item): DrizzleItemInsert {
    return {
      workspaceId: item.workspaceId,
      folderId: item.folderId ?? null,
      id: item.id.toString(),
      title: item.title,
      type: item.type,
      content: item.content ?? null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt ?? null,
    }
  }
}
