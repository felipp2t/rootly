import { type Either, right } from '@/core/types/either.ts'
import type { Item } from '../../enterprise/entities/item.ts'
import type { ItemRepository } from '../repositories/item-repository.ts'

interface GetItemsRequest {
  userId: string
  parentId?: string
  workspaceId?: string
  includeArchived?: boolean
}
type GetItemsResponse = Either<undefined, { items: Item[] }>

export class GetItemsUseCase {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute({
    userId,
    parentId,
    workspaceId,
    includeArchived,
  }: GetItemsRequest): Promise<GetItemsResponse> {
    const items = await this.itemRepository.findMany(
      userId,
      parentId,
      workspaceId,
      { includeArchived },
    )

    return right({ items })
  }
}
