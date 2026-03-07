import { eq, inArray, isNull } from 'drizzle-orm'
import type { FolderRepository } from '@/domain/root/application/repositories/folder-repository.ts'
import type { Folder } from '@/domain/root/enterprise/entities/folder.ts'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleFolderMapper } from '../mappers/drizzle-folder-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleFolderRepository implements FolderRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  private async loadTagIdsByFolderIds(
    folderIds: string[],
  ): Promise<Record<string, string[]>> {
    if (folderIds.length === 0) return {}

    const rows = await this.db
      .select()
      .from(schema.folderTags)
      .where(inArray(schema.folderTags.folderId, folderIds))

    return rows.reduce<Record<string, string[]>>((acc, row) => {
      acc[row.folderId] = [...(acc[row.folderId] ?? []), row.tagId]
      return acc
    }, {})
  }

  async findById(id: string): Promise<Folder | null> {
    const rows = await this.db
      .select()
      .from(schema.folders)
      .where(eq(schema.folders.id, id))

    if (rows.length === 0) return null

    const tagsByFolder = await this.loadTagIdsByFolderIds([id])

    return DrizzleFolderMapper.toDomain(rows[0], tagsByFolder[id] ?? [])
  }

  async findByName(name: string): Promise<Folder | null> {
    const rows = await this.db
      .select()
      .from(schema.folders)
      .where(eq(schema.folders.name, name))

    if (rows.length === 0) return null

    const tagsByFolder = await this.loadTagIdsByFolderIds([rows[0].id])

    return DrizzleFolderMapper.toDomain(rows[0], tagsByFolder[rows[0].id] ?? [])
  }

  async findAll(): Promise<Folder[]> {
    const rows = await this.db.select().from(schema.folders)

    if (rows.length === 0) return []

    const tagsByFolder = await this.loadTagIdsByFolderIds(rows.map((r) => r.id))

    return rows.map((row) =>
      DrizzleFolderMapper.toDomain(row, tagsByFolder[row.id] ?? []),
    )
  }

  async findByParentId(parentId: string | null): Promise<Folder[]> {
    const rows = await this.db
      .select()
      .from(schema.folders)
      .where(
        parentId === null
          ? isNull(schema.folders.parentId)
          : eq(schema.folders.parentId, parentId),
      )

    if (rows.length === 0) return []

    const tagsByFolder = await this.loadTagIdsByFolderIds(rows.map((r) => r.id))

    return rows.map((row) =>
      DrizzleFolderMapper.toDomain(row, tagsByFolder[row.id] ?? []),
    )
  }

  async create(folder: Folder): Promise<void> {
    await this.db
      .insert(schema.folders)
      .values(DrizzleFolderMapper.toDrizzle(folder))

    if (folder.tagIds.length > 0) {
      await this.db.insert(schema.folderTags).values(
        folder.tagIds.map((tagId) => ({
          folderId: folder.id.toString(),
          tagId,
        })),
      )
    }
  }

  async save(folder: Folder): Promise<void> {
    await this.db
      .update(schema.folders)
      .set(DrizzleFolderMapper.toDrizzle(folder))
      .where(eq(schema.folders.id, folder.id.toString()))

    await this.db
      .delete(schema.folderTags)
      .where(eq(schema.folderTags.folderId, folder.id.toString()))

    if (folder.tagIds.length > 0) {
      await this.db.insert(schema.folderTags).values(
        folder.tagIds.map((tagId) => ({
          folderId: folder.id.toString(),
          tagId,
        })),
      )
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.folders).where(eq(schema.folders.id, id))
  }
}
