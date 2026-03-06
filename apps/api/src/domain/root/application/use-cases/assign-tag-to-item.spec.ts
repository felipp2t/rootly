import { makeFolder } from '@test/factories/make-folder.ts'
import { makeItem } from '@test/factories/make-item.ts'
import { makeTag } from '@test/factories/make-tag.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryItemRepository } from '@test/repositories/in-memory-item-repository.ts'
import { InMemoryTagRepository } from '@test/repositories/in-memory-tag-repository.ts'
import { ItemNotFoundError } from './_errors/item-not-found-error.ts'
import { TagNotFoundError } from './_errors/tag-not-found-error.ts'
import { AssignTagToItemUseCase } from './assign-tag-to-item.ts'

let itemRepository: InMemoryItemRepository
let tagRepository: InMemoryTagRepository
let sut: AssignTagToItemUseCase

describe('AssignTagToItem', () => {
  beforeEach(() => {
    itemRepository = new InMemoryItemRepository()
    tagRepository = new InMemoryTagRepository()
    sut = new AssignTagToItemUseCase(itemRepository, tagRepository)
  })

  it('should be able to assign a tag to an item', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    const item = makeItem({ folderId: folder.id.toString() })
    const tag = makeTag({ workspaceId: workspace.id.toString() })

    await itemRepository.create(item)
    await tagRepository.create(tag)

    const response = await sut.execute({
      itemId: item.id.toString(),
      tagId: tag.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(itemRepository.items[0].tagIds).toContain(tag.id.toString())
  })

  it('should be able to assign multiple tags to an item', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    const item = makeItem({ folderId: folder.id.toString() })
    const tagA = makeTag({ workspaceId: workspace.id.toString() })
    const tagB = makeTag({ workspaceId: workspace.id.toString() })

    await itemRepository.create(item)
    await tagRepository.create(tagA)
    await tagRepository.create(tagB)

    await sut.execute({ itemId: item.id.toString(), tagId: tagA.id.toString() })
    await sut.execute({ itemId: item.id.toString(), tagId: tagB.id.toString() })

    expect(itemRepository.items[0].tagIds).toHaveLength(2)
    expect(itemRepository.items[0].tagIds).toContain(tagA.id.toString())
    expect(itemRepository.items[0].tagIds).toContain(tagB.id.toString())
  })

  it('should be idempotent when assigning the same tag twice', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    const item = makeItem({ folderId: folder.id.toString() })
    const tag = makeTag({ workspaceId: workspace.id.toString() })

    await itemRepository.create(item)
    await tagRepository.create(tag)

    await sut.execute({ itemId: item.id.toString(), tagId: tag.id.toString() })
    const response = await sut.execute({
      itemId: item.id.toString(),
      tagId: tag.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(itemRepository.items[0].tagIds).toHaveLength(1)
  })

  it('should not be able to assign a tag to a non-existing item', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const tag = makeTag({ workspaceId: workspace.id.toString() })

    await tagRepository.create(tag)

    const response = await sut.execute({
      itemId: 'non-existing-item-id',
      tagId: tag.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ItemNotFoundError)
  })

  it('should not be able to assign a non-existing tag to an item', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    const item = makeItem({ folderId: folder.id.toString() })

    await itemRepository.create(item)

    const response = await sut.execute({
      itemId: item.id.toString(),
      tagId: 'non-existing-tag-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(TagNotFoundError)
  })
})
