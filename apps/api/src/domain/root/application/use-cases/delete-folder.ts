import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { FolderRepository } from '../repositories/folder-repository.ts'
import type { ItemRepository } from '../repositories/item-repository.ts'
import { FolderNotEmptyError } from './errors/folder-not-empty-error.ts'
import { FolderNotFoundError } from './errors/folder-not-found-error.ts'

interface DeleteFolderUseCaseRequest {
  folderId: string
  actorId?: string
}

type DeleteFolderUseCaseResponse = Either<BaseError, null>

export class DeleteFolderUseCase {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly itemRepository: ItemRepository,
  ) {}

  async execute({
    folderId,
    actorId,
  }: DeleteFolderUseCaseRequest): Promise<DeleteFolderUseCaseResponse> {
    const folder = await this.folderRepository.findById(folderId)

    if (!folder) {
      return left(new FolderNotFoundError())
    }

    const hasSubfolders = await this.folderRepository.hasSubfolders(folderId)

    if (hasSubfolders) {
      return left(new FolderNotEmptyError('Folder contains subfolders.'))
    }

    const hasItems = await this.itemRepository.hasItems(folderId)

    if (hasItems) {
      return left(
        new FolderNotEmptyError('Folder contains active or archived items.'),
      )
    }

    folder.delete(actorId)

    await this.folderRepository.delete(folderId)

    return right(null)
  }
}
