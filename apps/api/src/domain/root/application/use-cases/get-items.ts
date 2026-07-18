import { type Either, right } from '@/core/types/either.ts'
import type { Paginated } from '@/core/types/paginated.ts'
import type { Item } from '../../enterprise/entities/item.ts'
import type { ItemRepository } from '../repositories/item-repository.ts'

interface GetItemsRequest {
  userId: string
  parentId?: string
  workspaceId?: string
  includeArchived?: boolean
  page?: number
  limit?: number
}
type GetItemsResponse = Either<undefined, Paginated<Item>>

export class GetItemsUseCase {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute({
    userId,
    parentId,
    workspaceId,
    includeArchived,
    page,
    limit,
  }: GetItemsRequest): Promise<GetItemsResponse> {
    const result = await this.itemRepository.findMany(
      userId,
      parentId,
      workspaceId,
      { includeArchived, page, limit },
    )

    return right(result)
  }
}
