import { makeItem } from '@test/factories/make-item.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryItemRepository } from '@test/repositories/in-memory-item-repository.ts'
import { ArchiveItemUseCase } from './archive-item.ts'
import { ItemAlreadyArchivedError } from './errors/item-already-archived-error.ts'
import { ItemNotFoundError } from './errors/item-not-found-error.ts'

let itemRepository: InMemoryItemRepository
let sut: ArchiveItemUseCase

describe('ArchiveItem', () => {
  beforeEach(() => {
    itemRepository = new InMemoryItemRepository()
    sut = new ArchiveItemUseCase(itemRepository)
  })

  it('should be able to archive an item', {
    tags: ['archive-item'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({ workspaceId: workspace.id.toString() })
    await itemRepository.create(item)

    const response = await sut.execute({ itemId: item.id.toString() })

    expect(response.isRight()).toBe(true)
    expect(response.value).toBeNull()
    expect(itemRepository.items[0].isArchived).toBe(true)
    expect(itemRepository.items[0].archivedAt).toBeInstanceOf(Date)
  })

  it('should return ItemNotFoundError when the item does not exist', {
    tags: ['archive-item'],
  }, async () => {
    const response = await sut.execute({ itemId: 'non-existent-item-id' })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ItemNotFoundError)
  })

  it('should return ItemAlreadyArchivedError when the item is already archived', {
    tags: ['archive-item'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({ workspaceId: workspace.id.toString() })
    item.archive()
    await itemRepository.create(item)

    const response = await sut.execute({ itemId: item.id.toString() })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ItemAlreadyArchivedError)
  })

  it('should tag the archived-item event with the provided actorId', {
    tags: ['archive-item'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({ workspaceId: workspace.id.toString() })
    await itemRepository.create(item)

    await sut.execute({ itemId: item.id.toString(), actorId: 'user-1' })

    const event = itemRepository.items[0].domainEvents.at(-1)
    expect(event).toMatchObject({ actorId: 'user-1' })
  })
})
