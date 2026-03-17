import { type Either, right } from '@/core/types/either.ts'
import type { Folder } from '../../enterprise/entities/folder.ts'
import type { FolderRepository } from '../repositories/folder-repository.ts'

interface GetFoldersUseCaseRequest {
  userId: string
  parentId?: string
  workspaceId?: string
}
type GetFoldersUseCaseResponse = Either<undefined, { folders: Folder[] }>

export class GetFoldersUseCase {
  constructor(private readonly folderRepository: FolderRepository) {}

  async execute({
    userId,
    parentId,
    workspaceId,
  }: GetFoldersUseCaseRequest): Promise<GetFoldersUseCaseResponse> {
    const folders = await this.folderRepository.findMany(userId, parentId, workspaceId)

    return right({ folders })
  }
}
