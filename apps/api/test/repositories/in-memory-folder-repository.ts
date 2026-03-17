import type { FolderRepository } from '@/domain/root/application/repositories/folder-repository.ts'
import type { Folder } from '@/domain/root/enterprise/entities/folder.ts'

export class InMemoryFolderRepository implements FolderRepository {
  items: Folder[] = []
  workspaceMembers: { userId: string; workspaceId: string }[] = []

  async findById(id: string): Promise<Folder | null> {
    return this.items.find((folder) => folder.id.toString() === id) ?? null
  }

  async findByName(name: string): Promise<Folder | null> {
    return this.items.find((folder) => folder.name === name) ?? null
  }

  async findByWorkspaceId(workspaceId: string): Promise<Folder[]> {
    return this.items.filter((folder) => folder.workspaceId === workspaceId) ?? []
  }

  async findMany(userId: string, parentId?: string, workspaceId?: string): Promise<Folder[]> {
    const userWorkspaceIds = this.workspaceMembers
      .filter((m) => m.userId === userId)
      .map((m) => m.workspaceId)

    const scoped = this.items.filter((folder) => userWorkspaceIds.includes(folder.workspaceId))

    if (workspaceId !== undefined) {
      return scoped.filter(
        (folder) => folder.workspaceId === workspaceId && folder.parentId === undefined,
      )
    }
    if (parentId === undefined) return scoped
    return scoped.filter((folder) => folder.parentId === parentId)
  }

  async create(folder: Folder): Promise<void> {
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
