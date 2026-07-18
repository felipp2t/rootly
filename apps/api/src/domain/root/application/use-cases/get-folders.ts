import { type Either, right } from '@/core/types/either.ts'
import type { Paginated } from '@/core/types/paginated.ts'
import type {
  FolderRepository,
  FolderWithCounts,
} from '../repositories/folder-repository.ts'

interface GetFoldersUseCaseRequest {
  userId: string
  parentId?: string
  workspaceId?: string
  page?: number
  limit?: number
}
type GetFoldersUseCaseResponse = Either<undefined, Paginated<FolderWithCounts>>

export class GetFoldersUseCase {
  constructor(private readonly folderRepository: FolderRepository) {}

  async execute({
    userId,
    parentId,
    workspaceId,
    page,
    limit,
  }: GetFoldersUseCaseRequest): Promise<GetFoldersUseCaseResponse> {
    const result = await this.folderRepository.findManyWithCounts(
      userId,
      parentId,
      workspaceId,
      { page, limit },
    )

    return right(result)
  }
}
