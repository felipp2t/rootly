import { makeItem } from '@test/factories/make-item.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryItemRepository } from '@test/repositories/in-memory-item-repository.ts'
import { ItemArchivedError } from '../../enterprise/validators/_errors/item-archived-error.ts'
import { InvalidItemTitleError } from './errors/invalid-item-title-error.ts'
import { ItemNotFoundError } from './errors/item-not-found-error.ts'
import { UpdateItemUseCase } from './update-item.ts'

let itemRepository: InMemoryItemRepository
let sut: UpdateItemUseCase

describe('UpdateItem', () => {
  beforeEach(() => {
    itemRepository = new InMemoryItemRepository()
    sut = new UpdateItemUseCase(itemRepository)
  })

  it('should be able to update an item title', {
    tags: ['update-item'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({
      workspaceId: workspace.id.toString(),
      type: 'text',
      title: 'Old Title',
    })
    await itemRepository.create(item)

    const response = await sut.execute({
      itemId: item.id.toString(),
      title: 'New Title',
    })

    expect(response.isRight()).toBe(true)
    expect(itemRepository.items[0].title).toBe('New Title')
  })

  it('should be able to update an item content', {
    tags: ['update-item'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({
      workspaceId: workspace.id.toString(),
      type: 'text',
      content: 'old content',
    })
    await itemRepository.create(item)

    const response = await sut.execute({
      itemId: item.id.toString(),
      content: 'new content',
    })

    expect(response.isRight()).toBe(true)
    expect(itemRepository.items[0].content).toBe('new content')
  })

  it('should return ItemNotFoundError when the item does not exist', {
    tags: ['update-item'],
  }, async () => {
    const response = await sut.execute({
      itemId: 'non-existent-item-id',
      title: 'New Title',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ItemNotFoundError)
  })

  it('should return InvalidItemTitleError when the title is shorter than 3 characters', {
    tags: ['update-item'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({
      workspaceId: workspace.id.toString(),
      type: 'text',
    })
    await itemRepository.create(item)

    const response = await sut.execute({
      itemId: item.id.toString(),
      title: 'vi',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidItemTitleError)
  })

  it('should return InvalidItemTitleError when the title is longer than 32 characters', {
    tags: ['update-item'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({
      workspaceId: workspace.id.toString(),
      type: 'text',
    })
    await itemRepository.create(item)

    const response = await sut.execute({
      itemId: item.id.toString(),
      title: 'a'.repeat(33),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidItemTitleError)
  })

  it('should return ItemArchivedError when the item is archived', {
    tags: ['update-item'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const item = makeItem({
      workspaceId: workspace.id.toString(),
      type: 'text',
    })
    item.archive()
    await itemRepository.create(item)

    const response = await sut.execute({
      itemId: item.id.toString(),
      title: 'New Title',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ItemArchivedError)
  })
})
