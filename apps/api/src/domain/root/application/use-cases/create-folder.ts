import { Folder } from '../../enterprise/entities/folder.ts'
import type { FolderRepository } from '../repositories/folder-repository.ts'
import { FolderAlreadyExistsError } from './_errors/folder-already-exists-error.ts'
import { InvalidFolderNameError } from './_errors/invalid-folder-name-error.ts'

interface CreateFolderUseCaseRequest {
  name: string
  parentId?: string
}

export class CreateFolderUseCase {
  constructor(private readonly folderRepositoy: FolderRepository) {}

  async execute({ name, parentId }: CreateFolderUseCaseRequest) {
    const folder = await this.folderRepositoy.findByName(name)

    if (folder && folder.name === name && folder.parentId === parentId) {
      throw new FolderAlreadyExistsError()
    }

    if (typeof name === 'string' && name.trim().length < 3) {
      throw new InvalidFolderNameError()
    }

    if (typeof name === 'string' && name.trim().length > 32) {
      throw new InvalidFolderNameError()
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
