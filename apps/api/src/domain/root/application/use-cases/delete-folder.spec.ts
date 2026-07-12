import { makeFolder } from '@test/factories/make-folder.ts'
import { makeItem } from '@test/factories/make-item.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryFolderRepository } from '@test/repositories/in-memory-folder-repository.ts'
import { InMemoryItemRepository } from '@test/repositories/in-memory-item-repository.ts'
import { DeleteFolderUseCase } from './delete-folder.ts'
import { FolderNotEmptyError } from './errors/folder-not-empty-error.ts'
import { FolderNotFoundError } from './errors/folder-not-found-error.ts'

let folderRepository: InMemoryFolderRepository
let itemRepository: InMemoryItemRepository
let sut: DeleteFolderUseCase

describe('DeleteFolder', () => {
  beforeEach(() => {
    folderRepository = new InMemoryFolderRepository()
    itemRepository = new InMemoryItemRepository()
    sut = new DeleteFolderUseCase(folderRepository, itemRepository)
  })

  it('should return FolderNotFoundError when the folder does not exist', {
    tags: ['delete-folder'],
  }, async () => {
    const response = await sut.execute({ folderId: 'non-existent-folder-id' })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(FolderNotFoundError)
  })

  it('should return FolderNotEmptyError when the folder has a subfolder, even if that subfolder is itself empty', {
    tags: ['delete-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    await folderRepository.create(folder)

    const subfolder = makeFolder({
      workspaceId: workspace.id.toString(),
      parentId: folder.id.toString(),
    })
    await folderRepository.create(subfolder)

    const response = await sut.execute({ folderId: folder.id.toString() })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(FolderNotEmptyError)
    expect(folderRepository.items).toHaveLength(2)
  })

  it('should return FolderNotEmptyError when the folder has an active item', {
    tags: ['delete-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    await folderRepository.create(folder)

    const item = makeItem({
      workspaceId: workspace.id.toString(),
      folderId: folder.id.toString(),
    })
    await itemRepository.create(item)

    const response = await sut.execute({ folderId: folder.id.toString() })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(FolderNotEmptyError)
    expect(folderRepository.items).toHaveLength(1)
  })

  it('should return FolderNotEmptyError when the folder has only an archived item', {
    tags: ['delete-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    await folderRepository.create(folder)

    const item = makeItem({
      workspaceId: workspace.id.toString(),
      folderId: folder.id.toString(),
    })
    item.archive()
    await itemRepository.create(item)

    const response = await sut.execute({ folderId: folder.id.toString() })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(FolderNotEmptyError)
    expect(folderRepository.items).toHaveLength(1)
  })

  it('should be able to delete a folder with no subfolders and no items', {
    tags: ['delete-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    await folderRepository.create(folder)

    const response = await sut.execute({ folderId: folder.id.toString() })

    expect(response.isRight()).toBe(true)
    expect(response.value).toBeNull()
    expect(folderRepository.items).toHaveLength(0)
  })
})
