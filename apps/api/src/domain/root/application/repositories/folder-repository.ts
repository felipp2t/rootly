import type { Folder } from '../../enterprise/entities/folder.ts'

export abstract class FolderRepository {
  abstract findById(id: string): Promise<Folder | null>
  abstract findByName(name: string): Promise<Folder | null>
  abstract findManyByParentId(parentId: string | null): Promise<Folder[]>
  abstract create(folder: Folder): Promise<void>
  abstract save(folder: Folder): Promise<void>
  abstract delete(id: string): Promise<void>
}
