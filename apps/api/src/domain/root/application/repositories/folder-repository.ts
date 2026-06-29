import type { Folder } from '../../enterprise/entities/folder.ts'

export interface FolderWithCounts {
  folder: Folder
  itemCount: number
  subfolderCount: number
}

export abstract class FolderRepository {
  abstract findById(id: string): Promise<Folder | null>
  abstract findManyByIds(ids: string[]): Promise<Folder[]>
  abstract findByName(name: string): Promise<Folder | null>
  abstract findByNameInParent(
    workspaceId: string,
    name: string,
    parentId?: string,
  ): Promise<Folder | null>
  abstract findByWorkspaceId(workspaceId: string): Promise<Folder[]>
  abstract findMany(userId: string, parentId?: string, workspaceId?: string): Promise<Folder[]>
  abstract findManyWithCounts(userId: string, parentId?: string, workspaceId?: string): Promise<FolderWithCounts[]>
  abstract create(folder: Folder): Promise<void>
  abstract save(folder: Folder): Promise<void>
  abstract delete(id: string): Promise<void>
}
