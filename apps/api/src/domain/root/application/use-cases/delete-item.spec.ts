import { makeItem } from '@test/factories/make-item.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryItemRepository } from '@test/repositories/in-memory-item-repository.ts'
import { InMemoryStorageRepository } from '@test/repositories/in-memory-storage-repository.ts'
import { DeleteItemUseCase } from './delete-item.ts'
import { ItemNotArchivedError } from './errors/item-not-archived-error.ts'
import { ItemNotFoundError } from './errors/item-not-found-error.ts'

let itemRepository: InMemoryItemRepository
let storageRepository: InMemoryStorageRepository
let sut: DeleteItemUseCase

describe('DeleteItem', () => {
  beforeEach(() => {
    itemRepository = new InMemoryItemRepository()
    storageRepository = new InMemoryStorageRepository()
    sut = new DeleteItemUseCase(itemRepository, storageRepository)
  })

  it('should be able to permanently delete an archived item', {
    tags: ['delete-item'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({
      workspaceId: workspace.id.toString(),
      type: 'text',
      content: 'some text',
    })
    item.archive()
    await itemRepository.create(item)

    const response = await sut.execute({ itemId: item.id.toString() })

    expect(response.isRight()).toBe(true)
    expect(response.value).toBeNull()
    expect(itemRepository.items).toHaveLength(0)
  })

  it('should return ItemNotFoundError when the item does not exist', {
    tags: ['delete-item'],
  }, async () => {
    const response = await sut.execute({ itemId: 'non-existent-item-id' })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ItemNotFoundError)
  })

  it('should return ItemNotArchivedError when the item is not archived', {
    tags: ['delete-item'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({ workspaceId: workspace.id.toString() })
    await itemRepository.create(item)

    const response = await sut.execute({ itemId: item.id.toString() })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ItemNotArchivedError)
    expect(itemRepository.items).toHaveLength(1)
  })

  it('should call storage delete with the item content key when type is document and content is set', {
    tags: ['delete-item'],
  }, async () => {
    const deleteSpy = vi.spyOn(storageRepository, 'delete')

    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({
      workspaceId: workspace.id.toString(),
      type: 'document',
      content: 'in-memory/report.pdf',
    })
    item.archive()
    await itemRepository.create(item)

    const response = await sut.execute({ itemId: item.id.toString() })

    expect(response.isRight()).toBe(true)
    expect(deleteSpy).toHaveBeenCalledWith('in-memory/report.pdf')
    expect(itemRepository.items).toHaveLength(0)
  })

  it('should not call storage delete when type is document but content is not set', {
    tags: ['delete-item'],
  }, async () => {
    const deleteSpy = vi.spyOn(storageRepository, 'delete')

    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({
      workspaceId: workspace.id.toString(),
      type: 'text',
      content: undefined,
    })
    item.archive()
    await itemRepository.create(item)

    const response = await sut.execute({ itemId: item.id.toString() })

    expect(response.isRight()).toBe(true)
    expect(deleteSpy).not.toHaveBeenCalled()
  })

  it('should not call storage delete when type is not document', {
    tags: ['delete-item'],
  }, async () => {
    const deleteSpy = vi.spyOn(storageRepository, 'delete')

    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({
      workspaceId: workspace.id.toString(),
      type: 'secret',
      content: '12345678',
    })
    item.archive()
    await itemRepository.create(item)

    const response = await sut.execute({ itemId: item.id.toString() })

    expect(response.isRight()).toBe(true)
    expect(deleteSpy).not.toHaveBeenCalled()
  })
})
