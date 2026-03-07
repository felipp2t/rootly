import { type Either, right } from '@/core/types/either.ts'
import type { Folder } from '../../enterprise/entities/folder.ts'
import type { FolderRepository } from '../repositories/folder-repository.ts'

interface GetFoldersRequest {
  parentId?: string
}
type GetFoldersResponse = Either<undefined, { folders: Folder[] }>

export class GetFoldersUseCase {
  constructor(private readonly folderRepository: FolderRepository) {}

  async execute({ parentId }: GetFoldersRequest): Promise<GetFoldersResponse> {
    const folders = await this.folderRepository.findByParentId(parentId ?? null)

    return right({
      folders,
    })
  }
}
