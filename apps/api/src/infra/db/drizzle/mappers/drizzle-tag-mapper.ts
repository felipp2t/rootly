import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { Tag } from '@/domain/root/enterprise/entities/tag.ts'
import type { schema } from '../schema/index.ts'

type DrizzleTag = InferSelectModel<typeof schema.tags>
type DrizzleTagInsert = InferInsertModel<typeof schema.tags>

export class DrizzleTagMapper {
  static toDomain(raw: DrizzleTag): Tag {
    return Tag.create(
      {
        name: raw.name,
        color: raw.color,
        workspaceId: raw.workspaceId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ?? undefined,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toDrizzle(tag: Tag): DrizzleTagInsert {
    return {
      id: tag.id.toString(),
      name: tag.name,
      color: tag.color,
      workspaceId: tag.workspaceId,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt ?? null,
    }
  }
}
