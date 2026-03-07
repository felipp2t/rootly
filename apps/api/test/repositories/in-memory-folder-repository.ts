import type { FolderRepository } from '@/domain/root/application/repositories/folder-repository.ts'
import type { Folder } from '@/domain/root/enterprise/entities/folder.ts'

export class InMemoryFolderRepository implements FolderRepository {
  items: Folder[] = []

  async findById(id: string): Promise<Folder | null> {
    return this.items.find((folder) => folder.id.toString() === id) ?? null
  }

  async findByName(name: string): Promise<Folder | null> {
    return this.items.find((folder) => folder.name === name) ?? null
  }

  async findAll(): Promise<Folder[]> {
    return this.items
  }

  async findByParentId(parentId: string | null): Promise<Folder[]> {
    return this.items.filter((folder) => folder.parentId === parentId) ?? null
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
