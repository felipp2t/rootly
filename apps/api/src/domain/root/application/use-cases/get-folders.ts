import { type Either, right } from '@/core/types/either.ts'
import type { Folder } from '../../enterprise/entities/folder.ts'
import type { FolderRepository } from '../repositories/folder-repository.ts'

interface GetFoldersUseCaseRequest {
  parentId?: string
}
type GetFoldersUseCaseResponse = Either<undefined, { folders: Folder[] }>

export class GetFoldersUseCase {
  constructor(private readonly folderRepository: FolderRepository) {}

  async execute({ parentId }: GetFoldersUseCaseRequest): Promise<GetFoldersUseCaseResponse> {
    const folders = await this.folderRepository.findMany(parentId)

    return right({
      folders,
    })
  }
}
