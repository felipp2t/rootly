import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { Folder } from '@/domain/root/enterprise/entities/folder.ts'
import type { schema } from '../schema/index.ts'

type DrizzleFolder = InferSelectModel<typeof schema.folders>
type DrizzleFolderInsert = InferInsertModel<typeof schema.folders>

export class DrizzleFolderMapper {
  static toDomain(raw: DrizzleFolder): Folder {
    return Folder.create(
      {
        name: raw.name,
        createdAt: raw.createdAt,
        parentId: raw.parentId ?? undefined,
        updatedAt: raw.updatedAt ?? undefined,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toDrizzle(folder: Folder): DrizzleFolderInsert {
    return {
      id: folder.id.toString(),
      name: folder.name,
      createdAt: folder.createdAt,
      parentId: folder.parentId ?? null,
      updatedAt: folder.updatedAt ?? null,
    }
  }
}
