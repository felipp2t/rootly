import type { Tag } from '../../enterprise/entities/tag.ts'

export interface FindManyByWorkspaceIdOptions {
  cursor?: string
  limit: number
}

export interface FindManyByWorkspaceIdResult {
  tags: Tag[]
  nextCursor?: string
}

export abstract class TagRepository {
  abstract findById(id: string): Promise<Tag | null>
  abstract findBySlug(slug: string, workspaceId: string): Promise<Tag | null>
  abstract findManyByWorkspaceId(workspaceId: string, options: FindManyByWorkspaceIdOptions): Promise<FindManyByWorkspaceIdResult>
  abstract findAll(): Promise<Tag[]>
  abstract create(folder: Tag): Promise<void>
  abstract delete(id: string): Promise<void>
}
