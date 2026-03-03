import { Folder } from '../../enterprise/entities/folder.ts'
import type { FolderRepository } from '../repositories/folder-repository.ts'

interface CreateFolderUseCaseRequest {
  name: string
  parentId?: string
}

export class CreateFolderUseCase {
  constructor(private readonly folderRepositoy: FolderRepository) {}

  async execute({ name, parentId }: CreateFolderUseCaseRequest) {
    const folder = await this.folderRepositoy.findByName(name)

    if (folder && folder.name === name && folder.parentId === parentId) {
      throw new Error(
        'Folder with the same name already exists in the same parent folder',
      )
    }

    if (typeof name === 'string' && name.length < 3) {
      throw new Error('Folder name must be at least 3 characters long')
    }

    if (typeof name === 'string' && name.length > 32) {
      throw new Error('Folder name must be less than 32 characters long')
    }

    const newFolder = Folder.create({
      name,
      parentId,
    })

    await this.folderRepositoy.save(newFolder)

    return {
      folderId: newFolder.id,
    }
  }
}
