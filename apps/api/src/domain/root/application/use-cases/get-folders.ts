import { type Either, right } from '@/core/types/either.ts'
import type { FolderRepository, FolderWithCounts } from '../repositories/folder-repository.ts'

interface GetFoldersUseCaseRequest {
  userId: string
  parentId?: string
  workspaceId?: string
}
type GetFoldersUseCaseResponse = Either<undefined, { folders: FolderWithCounts[] }>

export class GetFoldersUseCase {
  constructor(private readonly folderRepository: FolderRepository) {}

  async execute({
    userId,
    parentId,
    workspaceId,
  }: GetFoldersUseCaseRequest): Promise<GetFoldersUseCaseResponse> {
    const folders = await this.folderRepository.findManyWithCounts(userId, parentId, workspaceId)

    return right({ folders })
  }
}
