import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import { safeEither } from '@/core/utils/safe-execute.ts'
import type { ItemRepository } from '../repositories/item-repository.ts'
import { InvalidItemTitleError } from './errors/invalid-item-title-error.ts'
import { ItemNotFoundError } from './errors/item-not-found-error.ts'

interface UpdateItemUseCaseRequest {
  itemId: string
  title?: string
  content?: string
  actorId?: string
}

type UpdateItemUseCaseResponse = Either<BaseError, null>

export class UpdateItemUseCase {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute({
    itemId,
    title,
    content,
    actorId,
  }: UpdateItemUseCaseRequest): Promise<UpdateItemUseCaseResponse> {
    const item = await this.itemRepository.findById(itemId)

    if (!item) {
      return left(new ItemNotFoundError())
    }

    if (title !== undefined) {
      const trimmedLength = title.trim().length

      if (trimmedLength < 3 || trimmedLength > 32) {
        return left(new InvalidItemTitleError())
      }
    }

    const updated = await safeEither(() =>
      item.update({ title, content }, actorId),
    )

    if (updated.isLeft()) {
      return left(updated.value)
    }

    await this.itemRepository.save(item)

    return right(null)
  }
}
