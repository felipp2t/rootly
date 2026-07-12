import { UniqueConstraintViolationError } from '@/core/errors/unique-constraint-violation-error.ts'
import type {
  FolderRepository,
  FolderWithCounts,
} from '@/domain/root/application/repositories/folder-repository.ts'
import type { Folder } from '@/domain/root/enterprise/entities/folder.ts'
import type { Item } from '@/domain/root/enterprise/entities/item.ts'

export class InMemoryFolderRepository implements FolderRepository {
  items: Folder[] = []
  itemsInFolders: Item[] = []
  workspaceMembers: { userId: string; workspaceId: string }[] = []

  async findById(id: string): Promise<Folder | null> {
    return this.items.find((folder) => folder.id.toString() === id) ?? null
  }

  async findManyByIds(ids: string[]): Promise<Folder[]> {
    if (ids.length === 0) return []
    return this.items.filter((folder) => ids.includes(folder.id.toString()))
  }

  async findByName(name: string): Promise<Folder | null> {
    return this.items.find((folder) => folder.name === name) ?? null
  }

  async findByNameInParent(
    workspaceId: string,
    name: string,
    parentId?: string,
  ): Promise<Folder | null> {
    return (
      this.items.find(
        (folder) =>
          folder.workspaceId === workspaceId &&
          folder.name === name &&
          folder.parentId === parentId,
      ) ?? null
    )
  }

  async findByWorkspaceId(workspaceId: string): Promise<Folder[]> {
    return (
      this.items.filter((folder) => folder.workspaceId === workspaceId) ?? []
    )
  }

  async findMany(
    userId: string,
    parentId?: string,
    workspaceId?: string,
  ): Promise<Folder[]> {
    const userWorkspaceIds = this.workspaceMembers
      .filter((m) => m.userId === userId)
      .map((m) => m.workspaceId)

    const scoped = this.items.filter((folder) =>
      userWorkspaceIds.includes(folder.workspaceId),
    )

    if (workspaceId !== undefined) {
      return scoped.filter(
        (folder) =>
          folder.workspaceId === workspaceId && folder.parentId === undefined,
      )
    }
    if (parentId === undefined) return scoped
    return scoped.filter((folder) => folder.parentId === parentId)
  }

  async findManyWithCounts(
    userId: string,
    parentId?: string,
    workspaceId?: string,
  ): Promise<FolderWithCounts[]> {
    const folders = await this.findMany(userId, parentId, workspaceId)
    return folders.map((folder) => ({
      folder,
      itemCount: this.itemsInFolders.filter(
        (item) => item.folderId === folder.id.toString() && !item.isArchived,
      ).length,
      subfolderCount: this.items.filter(
        (f) => f.parentId === folder.id.toString(),
      ).length,
    }))
  }

  async hasSubfolders(folderId: string): Promise<boolean> {
    return this.items.some((folder) => folder.parentId === folderId)
  }

  async create(folder: Folder): Promise<void> {
    const conflict = this.items.find(
      (existing) =>
        existing.workspaceId === folder.workspaceId &&
        existing.name === folder.name &&
        existing.parentId === folder.parentId,
    )

    if (conflict) {
      throw new UniqueConstraintViolationError('folders_unique_name_per_parent')
    }

    this.items.push(folder)
  }

  async save(folder: Folder): Promise<void> {
    const folderIndex = this.items.findIndex(
      (f) => f.id.toString() === folder.id.toString(),
    )

    if (folderIndex !== -1) {
      this.items[folderIndex] = folder
    }
  }

  async delete(id: string): Promise<void> {
    const folderIndex = this.items.findIndex(
      (folder) => folder.id.toString() === id,
    )

    if (folderIndex !== -1) {
      this.items.splice(folderIndex, 1)
    }
  }
}
