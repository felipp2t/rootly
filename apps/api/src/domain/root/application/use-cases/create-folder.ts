import type { BaseError } from '@/core/errors/base-error.ts'
import { UniqueConstraintViolationError } from '@/core/errors/unique-constraint-violation-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import { Folder } from '../../enterprise/entities/folder.ts'
import type { FolderRepository } from '../repositories/folder-repository.ts'
import { FolderAlreadyExistsError } from './errors/folder-already-exists-error.ts'
import { InvalidFolderNameError } from './errors/invalid-folder-name-error.ts'

interface CreateFolderUseCaseRequest {
  name: string
  parentId?: string
  workspaceId: string
  actorId?: string
}

type CreateFolderUseCaseResponse = Either<BaseError, { folderId: string }>

export class CreateFolderUseCase {
  constructor(private readonly folderRepositoy: FolderRepository) {}

  async execute({
    name,
    parentId,
    workspaceId,
    actorId,
  }: CreateFolderUseCaseRequest): Promise<CreateFolderUseCaseResponse> {
    const trimmedLength = name.trim().length

    if (trimmedLength < 3 || trimmedLength > 32) {
      return left(new InvalidFolderNameError())
    }

    const existing = await this.folderRepositoy.findByNameInParent(
      workspaceId,
      name,
      parentId,
    )

    if (existing) {
      return left(new FolderAlreadyExistsError())
    }

    const newFolder = Folder.create(
      {
        name,
        parentId,
        workspaceId,
      },
      undefined,
      actorId,
    )

    try {
      await this.folderRepositoy.create(newFolder)
    } catch (error) {
      if (error instanceof UniqueConstraintViolationError) {
        return left(new FolderAlreadyExistsError())
      }
      throw error
    }

    return right({
      folderId: newFolder.id.toString(),
    })
  }
}
