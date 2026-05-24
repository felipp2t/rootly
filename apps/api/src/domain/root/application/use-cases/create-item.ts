import type { BaseError } from '@/core/errors/base-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import { lookup } from '@/core/utils/lookup-file-type.ts'
import { safeEither } from '@/core/utils/safe-execute.ts'
import { Item, type ItemType } from '../../enterprise/entities/item.ts'
import type { ItemRepository } from '../repositories/item-repository.ts'
import type { StorageRepository } from '../repositories/storage-repository.ts'
import { InvalidItemTitleError } from './errors/invalid-item-title-error.ts'
import { ItemAlreadyExistsError } from './errors/item-already-exists-error.ts'

interface CreateItemUseCaseRequest {
  workspaceId: string
  folderId?: string
  type: ItemType
  title: string
  content?: string
  fileBuffer?: Buffer
  fileName?: string
}

type CreateItemUseCaseResponse = Either<BaseError, { itemId: string }>

export class CreateItemUseCase {
  constructor(
    private readonly itemRepository: ItemRepository,
    private storageRepository: StorageRepository,
  ) {}

  async execute({
    workspaceId,
    folderId,
    title,
    type,
    content,
    fileBuffer,
    fileName,
  }: CreateItemUseCaseRequest): Promise<CreateItemUseCaseResponse> {
    const item = await this.itemRepository.findByTitle(title)

    if (item?.title === title && item.folderId === folderId) {
      return left(new ItemAlreadyExistsError())
    }

    if (typeof title === 'string' && title.trim().length < 3) {
      return left(
        new InvalidItemTitleError('Title must be at least 3 characters long'),
      )
    }

    if (typeof title === 'string' && title.trim().length > 32) {
      return left(
        new InvalidItemTitleError(
          'Title must be no more than 32 characters long',
        ),
      )
    }

    if (type === 'document' && fileBuffer) {
      const mimeType = lookup(fileName ?? '') || 'application/octet-stream'

      const { key } = await this.storageRepository.upload({
        fileName: fileName!,
        fileBuffer: fileBuffer,
        mimeType,
      })
      content = key
    }

    const newItem = await safeEither(() =>
      Item.create({ workspaceId, folderId, type, title, content }),
    )

    if (newItem.isLeft()) {
      return left(newItem.value)
    }

    await this.itemRepository.create(newItem.value)

    return right({
      itemId: newItem.value.id.toString(),
    })
  }
}
