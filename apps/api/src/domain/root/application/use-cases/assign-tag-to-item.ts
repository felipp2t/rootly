import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { ItemRepository } from '../repositories/item-repository.ts'
import type { TagRepository } from '../repositories/tag-repository.ts'
import { ItemNotFoundError } from './errors/item-not-found-error.ts'
import { TagNotFoundError } from './errors/tag-not-found-error.ts'

interface AssignTagToItemUseCaseRequest {
  itemId: string
  tagId: string
}

type AssignTagToItemUseCaseResponse = Either<BaseError, void>

export class AssignTagToItemUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly tagRepository: TagRepository,
  ) {}

  async execute({
    itemId,
    tagId,
  }: AssignTagToItemUseCaseRequest): Promise<AssignTagToItemUseCaseResponse> {
    const item = await this.itemRepository.findById(itemId)

    if (!item) {
      return left(new ItemNotFoundError())
    }

    const tag = await this.tagRepository.findById(tagId)

    if (!tag) {
      return left(new TagNotFoundError())
    }

    if (item.tagIds.includes(tagId)) {
      return right(undefined)
    }

    item.tagIds = [...item.tagIds, tagId]

    await this.itemRepository.save(item)

    return right(undefined)
  }
}
