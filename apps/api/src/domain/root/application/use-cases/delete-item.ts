import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { ItemRepository } from '../repositories/item-repository.ts'
import type { StorageRepository } from '../repositories/storage-repository.ts'
import { ItemNotArchivedError } from './errors/item-not-archived-error.ts'
import { ItemNotFoundError } from './errors/item-not-found-error.ts'

interface DeleteItemUseCaseRequest {
  itemId: string
  actorId?: string
}

type DeleteItemUseCaseResponse = Either<BaseError, null>

export class DeleteItemUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly storageRepository: StorageRepository,
  ) {}

  async execute({
    itemId,
    actorId,
  }: DeleteItemUseCaseRequest): Promise<DeleteItemUseCaseResponse> {
    const item = await this.itemRepository.findById(itemId)

    if (!item) {
      return left(new ItemNotFoundError())
    }

    if (!item.isArchived) {
      return left(new ItemNotArchivedError())
    }

    if (item.type === 'document' && item.content) {
      await this.storageRepository.delete(item.content)
    }

    item.delete(actorId)

    await this.itemRepository.delete(itemId)

    return right(null)
  }
}
