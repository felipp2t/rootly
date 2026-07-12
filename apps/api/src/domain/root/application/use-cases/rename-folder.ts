import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { FolderRepository } from '../repositories/folder-repository.ts'
import { FolderAlreadyExistsError } from './errors/folder-already-exists-error.ts'
import { FolderNotFoundError } from './errors/folder-not-found-error.ts'
import { InvalidFolderNameError } from './errors/invalid-folder-name-error.ts'

interface RenameFolderUseCaseRequest {
  folderId: string
  name: string
  actorId?: string
}

type RenameFolderUseCaseResponse = Either<BaseError, null>

export class RenameFolderUseCase {
  constructor(private readonly folderRepository: FolderRepository) {}

  async execute({
    folderId,
    name,
    actorId,
  }: RenameFolderUseCaseRequest): Promise<RenameFolderUseCaseResponse> {
    const folder = await this.folderRepository.findById(folderId)

    if (!folder) {
      return left(new FolderNotFoundError())
    }

    const trimmedLength = name.trim().length

    if (trimmedLength < 3 || trimmedLength > 32) {
      return left(new InvalidFolderNameError())
    }

    const existing = await this.folderRepository.findByNameInParent(
      folder.workspaceId,
      name,
      folder.parentId,
    )

    if (existing && existing.id.toString() !== folderId) {
      return left(new FolderAlreadyExistsError())
    }

    folder.rename(name, actorId)

    await this.folderRepository.save(folder)

    return right(null)
  }
}
