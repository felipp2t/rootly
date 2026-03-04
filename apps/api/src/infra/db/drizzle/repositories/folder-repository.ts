import { eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { FolderRepository } from '@/domain/root/application/repositories/folder-repository.ts'
import type { Folder } from '@/domain/root/enterprise/entities/folder.ts'
import { DrizzleFolderMapper } from '../mappers/drizzle-folder-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleFolderRepository implements FolderRepository {
  constructor(private readonly db: NodePgDatabase) {}

  async findById(id: string): Promise<Folder | null> {
    const folders = await this.db
      .select()
      .from(schema.folders)
      .where(eq(schema.folders.id, id))

    if (folders.length === 0) {
      return null
    }

    return DrizzleFolderMapper.toDomain(folders[0])
  }

  async findByName(name: string): Promise<Folder | null> {
    const folders = await this.db
      .select()
      .from(schema.folders)
      .where(eq(schema.folders.name, name))

    if (folders.length === 0) {
      return null
    }

    return DrizzleFolderMapper.toDomain(folders[0])
  }

  async findAll(): Promise<Folder[]> {
    const folders = await this.db.select().from(schema.folders)

    return folders.map(DrizzleFolderMapper.toDomain)
  }

  async save(folder: Folder): Promise<void> {
    await this.db
      .insert(schema.folders)
      .values(DrizzleFolderMapper.toDrizzle(folder))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.folders).where(eq(schema.folders.id, id))
  }
}
