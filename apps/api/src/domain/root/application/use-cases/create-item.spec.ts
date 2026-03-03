import { makeFolder } from '../../../../../test/factories/make-folder.ts'
import { makeItem } from '../../../../../test/factories/make-item.ts'
import  { InMemoryFolderRepository } from '../../../../../test/repositories/in-memory-folder-repository.ts'
import { InMemoryItemRepository } from '../../../../../test/repositories/in-memory-item-repository.ts'
import { InvalidItemTypeError } from '../../enterprise/validators/_errors/invalid-item-type.ts'
import { InvalidItemTitleError } from './_errors/invalid-item-title-error.ts'
import { ItemAlreadyExistsError } from './_errors/item-already-exists-error.ts'
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
    folderRepository.save(makeFolder())

    const response = await sut.execute({
      folderId: folderRepository.folders[0].id.toString(),
      title: 'Test Item',
      type: 'text'
    })

    expect(response.itemId).toBeTruthy()
    expect(itemRepository.items.length).toBe(1)
    expect(itemRepository.items[0].content).toBeUndefined()

  })

  it('should be able create a item with text type and defined content', async () => {
    folderRepository.save(makeFolder())

    const response = await sut.execute({
      folderId: folderRepository.folders[0].id.toString(),
      title: 'Test Item',
      type: 'text',
      content: 'This is a test item'
    })

    expect(response.itemId).toBeTruthy()
    expect(itemRepository.items.length).toBe(1)
    expect(itemRepository.items[0].content).toBe('This is a test item')
  })

  it('should be able create a item with link type', async () => {
    folderRepository.save(makeFolder())

    const response = await sut.execute({
      folderId: folderRepository.folders[0].id.toString(),
      title: 'Test Item',
      type: 'link',
      content: 'https://www.example.com'
    })

    expect(response.itemId).toBeTruthy()
    expect(itemRepository.items.length).toBe(1)
    expect(itemRepository.items[0].content).toBe('https://www.example.com')
  })

  it('should not be able create a item with link type with invalid content', async () => {
    folderRepository.save(makeFolder())

    expect(sut.execute({
      folderId: folderRepository.folders[0].id.toString(),
      title: 'Test Item',
      type: 'link',
      content: 'www.example.com'
    })).rejects.toBeInstanceOf(InvalidItemTypeError)
  })

  it('should be able create a item with document type', async () => {
    folderRepository.save(makeFolder())

    const response = await sut.execute({
      folderId: folderRepository.folders[0].id.toString(),
      title: 'Test Item',
      type: 'document',
      content: 'a'.repeat(10_000)
    })

    expect(response.itemId).toBeTruthy()
    expect(itemRepository.items.length).toBe(1)
  })

  it('should not be able create a item with document type with invalid content', async () => {
    folderRepository.save(makeFolder())

    expect(sut.execute({
      folderId: folderRepository.folders[0].id.toString(),
      title: 'Test Item',
      type: 'document',
      content: 'a'.repeat(50_001)
    })).rejects.toBeInstanceOf(InvalidItemTypeError)
  })

  it('should be able create a item with secret type', async () => {
    folderRepository.save(makeFolder())

    const response = await sut.execute({
      folderId: folderRepository.folders[0].id.toString(),
      title: 'Test Item',
      type: 'secret',
      content: '12345678'
    })

    expect(response.itemId).toBeTruthy()
    expect(itemRepository.items.length).toBe(1)
  })

  it('should not be able create a item with secret type with invalid content', async () => {
    folderRepository.save(makeFolder())

    expect(sut.execute({
      folderId: folderRepository.folders[0].id.toString(),
      title: 'Test Item',
      type: 'secret',
      content: '123'
    })).rejects.toBeInstanceOf(InvalidItemTypeError)
  })

  it('should not be able create a item with the same title in the same folder', async () => {
    const folder = makeFolder()
    folderRepository.save(folder)

    const item = makeItem({ folderId: folder.id.toString() })
    itemRepository.save(item)

    expect(sut.execute({
      folderId: folder.id.toString(),
      title: item.title,
      type: 'secret',
      content: '123'
    })).rejects.toBeInstanceOf(ItemAlreadyExistsError)
  })

  it('should not be possible to create a item with title fewer than 3 characters', async () => {
    await expect(sut.execute(makeItem({ title: '' }))).rejects.toBeInstanceOf(
      InvalidItemTitleError,
    )
  })

  it('should not be possible to create a item with title more than 32 characters', async () => {
    await expect(sut.execute(makeItem({ title: 'a'.repeat(33) }))).rejects.toBeInstanceOf(
      InvalidItemTitleError,
    )
  })
})
