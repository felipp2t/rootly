import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import { Folder } from '../../enterprise/entities/folder.ts'
import type { FolderRepository } from '../repositories/folder-repository.ts'
import { FolderAlreadyExistsError } from './_errors/folder-already-exists-error.ts'
import { InvalidFolderNameError } from './_errors/invalid-folder-name-error.ts'

interface CreateFolderUseCaseRequest {
  name: string
  parentId?: string
  workspaceId: string
}

type CreateFolderUseCaseResponse = Either<BaseError, { folderId: string }>

export class CreateFolderUseCase {
  constructor(private readonly folderRepositoy: FolderRepository) {}

  async execute({
    name,
    parentId,
    workspaceId,
  }: CreateFolderUseCaseRequest): Promise<CreateFolderUseCaseResponse> {
    const folder = await this.folderRepositoy.findByName(name)

    if (folder && folder.name === name && folder.parentId === parentId) {
      return left(new FolderAlreadyExistsError())
    }

    if (typeof name === 'string' && name.trim().length < 3) {
      return left(new InvalidFolderNameError())
    }

    if (typeof name === 'string' && name.trim().length > 32) {
      return left(new InvalidFolderNameError())
    }

    const newFolder = Folder.create({
      name,
      parentId,
      workspaceId,
    })

    await this.folderRepositoy.save(newFolder)

    return right({
      folderId: newFolder.id.toString(),
    })
  }
}
