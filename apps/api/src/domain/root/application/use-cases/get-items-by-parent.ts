import { type Either, right } from '@/core/types/either.ts'
import type { Item } from '../../enterprise/entities/item.ts'
import type { ItemRepository } from '../repositories/item-repository.ts'

interface GetItemsRequest {
  parentId?: string
}
type GetItemsResponse = Either<undefined, { items: Item[] }>

export class GetItemsUseCase {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute({ parentId }: GetItemsRequest): Promise<GetItemsResponse> {
    const items = await this.itemRepository.findByParentId(parentId ?? null)

    return right({
      items,
    })
  }
}
