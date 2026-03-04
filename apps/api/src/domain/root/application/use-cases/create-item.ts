import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import { safeEither } from '@/core/utils/safe-execute.ts'
import { Item, type ItemType } from '../../enterprise/entities/item.ts'
import type { ItemRepository } from '../repositories/item-repository.ts'
import { InvalidItemTitleError } from './_errors/invalid-item-title-error.ts'
import { ItemAlreadyExistsError } from './_errors/item-already-exists-error.ts'

interface CreateItemUseCaseRequest {
  folderId: string
  type: ItemType
  title: string
  content?: string
}

type CreateItemUseCaseResponse = Either<BaseError, { itemId: string }>

export class CreateItemUseCase {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute({
    folderId,
    title,
    type,
    content,
  }: CreateItemUseCaseRequest): Promise<CreateItemUseCaseResponse> {
    const item = await this.itemRepository.findByTitle(title)

    if (item && item.title === title && item.folderId === folderId) {
      return left(new ItemAlreadyExistsError())
    }

    if (typeof title === 'string' && title.trim().length < 3) {
      return left(new InvalidItemTitleError())
    }

    if (typeof title === 'string' && title.trim().length > 32) {
      return left(new InvalidItemTitleError())
    }

    const newItem = await safeEither(() =>
      Item.create({ folderId, type, title, content }),
    )

    if (newItem.isLeft()) {
      return left(newItem.value)
    }

    await this.itemRepository.save(newItem.value)

    return right({
      itemId: newItem.value.id.toString(),
    })
  }
}
