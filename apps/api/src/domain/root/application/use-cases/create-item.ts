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

export class CreateItemUseCase {
  constructor(private readonly itemRepository: ItemRepository) {}

  async execute({ folderId, title, type, content }: CreateItemUseCaseRequest) {
    const item = await this.itemRepository.findByTitle(title)

    if (item && item.title === title && item.folderId === folderId) {
      throw new ItemAlreadyExistsError()
    }

    if (typeof title === 'string' && title.trim().length < 3) {
      throw new InvalidItemTitleError()
    }

    if (typeof title === 'string' && title.trim().length > 32) {
      throw new InvalidItemTitleError()
    }

    const newItem = Item.create({
      folderId,
      type,
      title,
      content,
    })

    await this.itemRepository.save(newItem)

    return {
      itemId: newItem.id,
    }
  }
}
