import { and, eq } from 'drizzle-orm'
import type { TagRepository } from '@/domain/root/application/repositories/tag-repository.ts'
import type { Tag } from '@/domain/root/enterprise/entities/tag.ts'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleTagMapper } from '../mappers/drizzle-tag-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleTagRepository implements TagRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: string): Promise<Tag | null> {
    const rows = await this.db
      .select()
      .from(schema.tags)
      .where(eq(schema.tags.id, id))

    if (rows.length === 0) return null

    return DrizzleTagMapper.toDomain(rows[0])
  }

  async findBySlug(slug: string, workspaceId: string): Promise<Tag | null> {
    const rows = await this.db
      .select()
      .from(schema.tags)
      .where(and(eq(schema.tags.slug, slug), eq(schema.tags.workspaceId, workspaceId)))

    if (rows.length === 0) return null

    return DrizzleTagMapper.toDomain(rows[0])
  }

  async findManyByWorkspaceId(workspaceId: string): Promise<Tag[]> {
    const rows = await this.db
      .select()
      .from(schema.tags)
      .where(eq(schema.tags.workspaceId, workspaceId))

    return rows.map(DrizzleTagMapper.toDomain)
  }

  async findAll(): Promise<Tag[]> {
    const rows = await this.db.select().from(schema.tags)

    return rows.map(DrizzleTagMapper.toDomain)
  }

  async create(tag: Tag): Promise<void> {
    await this.db.insert(schema.tags).values(DrizzleTagMapper.toDrizzle(tag))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.tags).where(eq(schema.tags.id, id))
  }
}
