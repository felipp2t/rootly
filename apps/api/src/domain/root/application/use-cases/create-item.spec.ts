import { makeFolder } from '@test/factories/make-folder.ts'
import { makeItem } from '@test/factories/make-item.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryFolderRepository } from '@test/repositories/in-memory-folder-repository.ts'
import { InMemoryItemRepository } from '@test/repositories/in-memory-item-repository.ts'
import { InvalidItemTypeError } from '../../enterprise/validators/_errors/invalid-item-type.ts'
import { InvalidItemTitleError } from './errors/invalid-item-title-error.ts'
import { ItemAlreadyExistsError } from './errors/item-already-exists-error.ts'
import { CreateItemUseCase } from './create-item.ts'

let itemRepository: InMemoryItemRepository
let folderRepository: InMemoryFolderRepository
let sut: CreateItemUseCase

describe('CreateFolder', () => {
  beforeEach(() => {
    itemRepository = new InMemoryItemRepository()
    folderRepository = new InMemoryFolderRepository()
    sut = new CreateItemUseCase(itemRepository)
  })

  it('should be able create a item with text type without content', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    folderRepository.create(
      makeFolder({ workspaceId: workspace.id.toString() }),
    )

    const response = await sut.execute({
      workspaceId: workspace.id.toString(),
      folderId: folderRepository.items[0].id.toString(),
      title: 'Test Item',
      type: 'text',
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ itemId: expect.any(String) })
    expect(itemRepository.items.length).toBe(1)
    expect(itemRepository.items[0].content).toBeUndefined()
  })

  it('should be able create a item with text type and defined content', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    folderRepository.create(
      makeFolder({ workspaceId: workspace.id.toString() }),
    )

    const response = await sut.execute({
      workspaceId: workspace.id.toString(),
      folderId: folderRepository.items[0].id.toString(),
      title: 'Test Item',
      type: 'text',
      content: 'This is a test item',
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ itemId: expect.any(String) })
    expect(itemRepository.items.length).toBe(1)
    expect(itemRepository.items[0].content).toBe('This is a test item')
  })

  it('should be able create a item with link type', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    folderRepository.create(
      makeFolder({ workspaceId: workspace.id.toString() }),
    )

    const response = await sut.execute({
      workspaceId: workspace.id.toString(),
      folderId: folderRepository.items[0].id.toString(),
      title: 'Test Item',
      type: 'link',
      content: 'https://www.example.com',
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ itemId: expect.any(String) })
    expect(itemRepository.items.length).toBe(1)
    expect(itemRepository.items[0].content).toBe('https://www.example.com')
  })

  it('should not be able create a item with link type with invalid content', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    folderRepository.create(
      makeFolder({ workspaceId: workspace.id.toString() }),
    )

    const response = await sut.execute({
      workspaceId: workspace.id.toString(),
      folderId: folderRepository.items[0].id.toString(),
      title: 'Test Item',
      type: 'link',
      content: 'www.example.com',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidItemTypeError)
  })

  it('should be able create a item with document type', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    folderRepository.create(
      makeFolder({ workspaceId: workspace.id.toString() }),
    )

    const response = await sut.execute({
      workspaceId: workspace.id.toString(),
      folderId: folderRepository.items[0].id.toString(),
      title: 'Test Item',
      type: 'document',
      content: 'a'.repeat(10_000),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ itemId: expect.any(String) })
    expect(itemRepository.items.length).toBe(1)
  })

  it('should not be able create a item with document type with invalid content', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    folderRepository.create(
      makeFolder({ workspaceId: workspace.id.toString() }),
    )

    const response = await sut.execute({
      workspaceId: workspace.id.toString(),
      folderId: folderRepository.items[0].id.toString(),
      title: 'Test Item',
      type: 'document',
      content: 'a'.repeat(50_001),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidItemTypeError)
  })

  it('should be able create a item with secret type', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    folderRepository.create(
      makeFolder({ workspaceId: workspace.id.toString() }),
    )

    const response = await sut.execute({
      workspaceId: workspace.id.toString(),
      folderId: folderRepository.items[0].id.toString(),
      title: 'Test Item',
      type: 'secret',
      content: '12345678',
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ itemId: expect.any(String) })
    expect(itemRepository.items.length).toBe(1)
  })

  it('should not be able create a item with secret type with invalid content', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    folderRepository.create(
      makeFolder({ workspaceId: workspace.id.toString() }),
    )

    const response = await sut.execute({
      workspaceId: workspace.id.toString(),
      folderId: folderRepository.items[0].id.toString(),
      title: 'Test Item',
      type: 'secret',
      content: '123',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidItemTypeError)
  })

  it('should be able to create an item without a folder', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    const response = await sut.execute({
      workspaceId: workspace.id.toString(),
      title: 'Test Item',
      type: 'text',
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ itemId: expect.any(String) })
    expect(itemRepository.items.length).toBe(1)
    expect(itemRepository.items[0].folderId).toBeUndefined()
  })

  it('should not be able create a item with the same title in the same folder', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    folderRepository.create(folder)

    const item = makeItem({
      workspaceId: workspace.id.toString(),
      folderId: folder.id.toString(),
    })
    itemRepository.create(item)

    const response = await sut.execute({
      workspaceId: workspace.id.toString(),
      folderId: folder.id.toString(),
      title: item.title,
      type: 'secret',
      content: '123',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ItemAlreadyExistsError)
  })

  it('should not be possible to create a item with title fewer than 3 characters', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const response = await sut.execute(
      makeItem({ workspaceId: workspace.id.toString(), title: '' }),
    )

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidItemTitleError)
  })

  it('should not be possible to create a item with title more than 32 characters', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const response = await sut.execute(
      makeItem({ workspaceId: workspace.id.toString(), title: 'a'.repeat(33) }),
    )

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidItemTitleError)
  })
})
