import { and, count, eq, inArray, isNull } from 'drizzle-orm'
import {
  isPgUniqueViolation,
  UniqueConstraintViolationError,
} from '@/core/errors/unique-constraint-violation-error.ts'
import type { FolderRepository, FolderWithCounts } from '@/domain/root/application/repositories/folder-repository.ts'
import type { Folder } from '@/domain/root/enterprise/entities/folder.ts'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleFolderMapper } from '../mappers/drizzle-folder-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleFolderRepository implements FolderRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findManyByIds(ids: string[]): Promise<Folder[]> {
    if (ids.length === 0) return []

    const rows = await this.db
      .select()
      .from(schema.folders)
      .where(inArray(schema.folders.id, ids))

    return rows.map((row) => DrizzleFolderMapper.toDomain(row))
  }

  async findById(id: string): Promise<Folder | null> {
    const rows = await this.db
      .select()
      .from(schema.folders)
      .where(eq(schema.folders.id, id))

    if (rows.length === 0) return null

    return DrizzleFolderMapper.toDomain(rows[0])
  }

  async findByName(name: string): Promise<Folder | null> {
    const rows = await this.db
      .select()
      .from(schema.folders)
      .where(eq(schema.folders.name, name))

    if (rows.length === 0) return null

    return DrizzleFolderMapper.toDomain(rows[0])
  }

  async findByNameInParent(
    workspaceId: string,
    name: string,
    parentId?: string,
  ): Promise<Folder | null> {
    const rows = await this.db
      .select()
      .from(schema.folders)
      .where(
        and(
          eq(schema.folders.workspaceId, workspaceId),
          eq(schema.folders.name, name),
          parentId === undefined
            ? isNull(schema.folders.parentId)
            : eq(schema.folders.parentId, parentId),
        ),
      )

    if (rows.length === 0) return null

    return DrizzleFolderMapper.toDomain(rows[0])
  }

  async findByWorkspaceId(workspaceId: string): Promise<Folder[]> {
    const rows = await this.db
      .select()
      .from(schema.folders)
      .where(eq(schema.folders.workspaceId, workspaceId))

    return rows.map((row) => DrizzleFolderMapper.toDomain(row))
  }

  async findMany(userId: string, parentId?: string, workspaceId?: string): Promise<Folder[]> {
    const rows = await this.db
      .selectDistinct({ folder: schema.folders })
      .from(schema.folders)
      .innerJoin(
        schema.workspaceMembers,
        and(
          eq(schema.workspaceMembers.workspaceId, schema.folders.workspaceId),
          eq(schema.workspaceMembers.userId, userId),
        ),
      )
      .where(
        parentId !== undefined
          ? eq(schema.folders.parentId, parentId)
          : workspaceId !== undefined
            ? and(eq(schema.folders.workspaceId, workspaceId), isNull(schema.folders.parentId))
            : undefined,
      )

    return rows.map((row) => DrizzleFolderMapper.toDomain(row.folder))
  }

  async findManyWithCounts(userId: string, parentId?: string, workspaceId?: string): Promise<FolderWithCounts[]> {
    const folders = await this.findMany(userId, parentId, workspaceId)

    if (folders.length === 0) return []

    const folderIds = folders.map((f) => f.id.toString())

    const [itemCounts, subfolderCounts] = await Promise.all([
      this.db
        .select({ folderId: schema.items.folderId, total: count() })
        .from(schema.items)
        .where(inArray(schema.items.folderId, folderIds))
        .groupBy(schema.items.folderId),
      this.db
        .select({ parentId: schema.folders.parentId, total: count() })
        .from(schema.folders)
        .where(inArray(schema.folders.parentId, folderIds))
        .groupBy(schema.folders.parentId),
    ])

    const itemCountMap = Object.fromEntries(
      itemCounts.map((r) => [r.folderId, r.total]),
    )
    const subfolderCountMap = Object.fromEntries(
      subfolderCounts.map((r) => [r.parentId, r.total]),
    )

    return folders.map((folder) => ({
      folder,
      itemCount: itemCountMap[folder.id.toString()] ?? 0,
      subfolderCount: subfolderCountMap[folder.id.toString()] ?? 0,
    }))
  }

  async create(folder: Folder): Promise<void> {
    try {
      await this.db
        .insert(schema.folders)
        .values(DrizzleFolderMapper.toDrizzle(folder))
    } catch (error) {
      if (isPgUniqueViolation(error)) {
        throw new UniqueConstraintViolationError(error.constraint ?? 'unknown')
      }
      throw error
    }
  }

  async save(folder: Folder): Promise<void> {
    await this.db
      .update(schema.folders)
      .set(DrizzleFolderMapper.toDrizzle(folder))
      .where(eq(schema.folders.id, folder.id.toString()))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.folders).where(eq(schema.folders.id, id))
  }
}
