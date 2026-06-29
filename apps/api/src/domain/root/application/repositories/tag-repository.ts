import type { Tag } from '../../enterprise/entities/tag.ts'

export abstract class TagRepository {
  abstract findById(id: string): Promise<Tag | null>
  abstract findBySlug(slug: string, workspaceId: string): Promise<Tag | null>
  abstract findAll(): Promise<Tag[]>
  abstract create(folder: Tag): Promise<void>
  abstract delete(id: string): Promise<void>
}
