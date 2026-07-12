import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { ItemRepository } from '../repositories/item-repository.ts'
import { ItemAlreadyArchivedError } from './errors/item-already-archived-error.ts'
import { ItemNotFoundError } from './errors/item-not-found-error.ts'

interface ArchiveItemUseCaseRequest {
  itemId: string
  actorId?: string
}

type ArchiveItemUseCaseResponse = Either<BaseError, null>

export class ArchiveItemUseCase {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute({
    itemId,
    actorId,
  }: ArchiveItemUseCaseRequest): Promise<ArchiveItemUseCaseResponse> {
    const item = await this.itemRepository.findById(itemId)

    if (!item) {
      return left(new ItemNotFoundError())
    }

    if (item.isArchived) {
      return left(new ItemAlreadyArchivedError())
    }

    item.archive(actorId)

    await this.itemRepository.save(item)

    return right(null)
  }
}
