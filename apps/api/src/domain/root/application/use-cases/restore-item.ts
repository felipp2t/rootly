import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { ItemRepository } from '../repositories/item-repository.ts'
import { ItemNotArchivedError } from './errors/item-not-archived-error.ts'
import { ItemNotFoundError } from './errors/item-not-found-error.ts'

interface RestoreItemUseCaseRequest {
  itemId: string
}

type RestoreItemUseCaseResponse = Either<BaseError, null>

export class RestoreItemUseCase {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute({
    itemId,
  }: RestoreItemUseCaseRequest): Promise<RestoreItemUseCaseResponse> {
    const item = await this.itemRepository.findById(itemId)

    if (!item) {
      return left(new ItemNotFoundError())
    }

    if (!item.isArchived) {
      return left(new ItemNotArchivedError('Item is not archived.'))
    }

    item.restore()

    await this.itemRepository.save(item)

    return right(null)
  }
}
