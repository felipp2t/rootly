import type { FolderRepository } from '@/domain/root/application/repositories/folder-repository.ts'
import type { Folder } from '@/domain/root/enterprise/entities/folder.ts'

export class InMemoryFolderRepository implements FolderRepository {
  folders: Folder[] = []

  async findById(id: string): Promise<Folder | null> {
    return this.folders.find((folder) => folder.id.toString() === id) ?? null
  }

  async findByName(name: string): Promise<Folder | null> {
    return this.folders.find((folder) => folder.name === name) ?? null
  }

  async findAll(): Promise<Folder[]> {
    return this.folders
  }

  async save(folder: Folder): Promise<void> {
    this.folders.push(folder)
  }
  async delete(id: string): Promise<void> {
    const folderIndex = this.folders.findIndex(
      (folder) => folder.id.toString() === id,
    )

    if (folderIndex !== -1) {
      this.folders.splice(folderIndex, 1)
    }
  }
}
