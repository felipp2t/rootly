import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { FolderRepository } from '../repositories/folder-repository.ts'
import type { TagRepository } from '../repositories/tag-repository.ts'
import { FolderNotFoundError } from './_errors/folder-not-found-error.ts'
import { TagNotFoundError } from './_errors/tag-not-found-error.ts'

interface AssignTagToFolderUseCaseRequest {
  folderId: string
  tagId: string
}

type AssignTagToFolderUseCaseResponse = Either<BaseError, void>

export class AssignTagToFolderUseCase {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly tagRepository: TagRepository,
  ) {}

  async execute({
    folderId,
    tagId,
  }: AssignTagToFolderUseCaseRequest): Promise<AssignTagToFolderUseCaseResponse> {
    const folder = await this.folderRepository.findById(folderId)

    if (!folder) {
      return left(new FolderNotFoundError())
    }

    const tag = await this.tagRepository.findById(tagId)

    if (!tag) {
      return left(new TagNotFoundError())
    }

    if (folder.tagIds.includes(tagId)) {
      return right(undefined)
    }

    folder.tagIds = [...folder.tagIds, tagId]

    await this.folderRepository.update(folder)

    return right(undefined)
  }
}
