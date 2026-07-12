import { makeItem } from '@test/factories/make-item.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryItemRepository } from '@test/repositories/in-memory-item-repository.ts'
import { ItemNotArchivedError } from './errors/item-not-archived-error.ts'
import { ItemNotFoundError } from './errors/item-not-found-error.ts'
import { RestoreItemUseCase } from './restore-item.ts'

let itemRepository: InMemoryItemRepository
let sut: RestoreItemUseCase

describe('RestoreItem', () => {
  beforeEach(() => {
    itemRepository = new InMemoryItemRepository()
    sut = new RestoreItemUseCase(itemRepository)
  })

  it('should be able to restore an archived item', {
    tags: ['restore-item'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({ workspaceId: workspace.id.toString() })
    item.archive()
    await itemRepository.create(item)

    const response = await sut.execute({ itemId: item.id.toString() })

    expect(response.isRight()).toBe(true)
    expect(response.value).toBeNull()
    expect(itemRepository.items[0].isArchived).toBe(false)
    expect(itemRepository.items[0].archivedAt).toBeUndefined()
  })

  it('should return ItemNotFoundError when the item does not exist', {
    tags: ['restore-item'],
  }, async () => {
    const response = await sut.execute({ itemId: 'non-existent-item-id' })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ItemNotFoundError)
  })

  it('should return ItemNotArchivedError when the item is not archived', {
    tags: ['restore-item'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({ workspaceId: workspace.id.toString() })
    await itemRepository.create(item)

    const response = await sut.execute({ itemId: item.id.toString() })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ItemNotArchivedError)
  })
})
