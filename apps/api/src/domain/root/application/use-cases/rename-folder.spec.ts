import { makeFolder } from '@test/factories/make-folder.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryFolderRepository } from '@test/repositories/in-memory-folder-repository.ts'
import { FolderAlreadyExistsError } from './errors/folder-already-exists-error.ts'
import { FolderNotFoundError } from './errors/folder-not-found-error.ts'
import { InvalidFolderNameError } from './errors/invalid-folder-name-error.ts'
import { RenameFolderUseCase } from './rename-folder.ts'

let folderRepository: InMemoryFolderRepository
let sut: RenameFolderUseCase

describe('RenameFolder', () => {
  beforeEach(() => {
    folderRepository = new InMemoryFolderRepository()
    sut = new RenameFolderUseCase(folderRepository)
  })

  it('should be able to rename a folder', {
    tags: ['rename-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({
      workspaceId: workspace.id.toString(),
      name: 'Old Name',
    })
    await folderRepository.create(folder)

    const response = await sut.execute({
      folderId: folder.id.toString(),
      name: 'New Name',
    })

    expect(response.isRight()).toBe(true)
    expect(folderRepository.items[0].name).toBe('New Name')
  })

  it('should return FolderNotFoundError when the folder does not exist', {
    tags: ['rename-folder'],
  }, async () => {
    const response = await sut.execute({
      folderId: 'non-existent-folder-id',
      name: 'New Name',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(FolderNotFoundError)
  })

  it('should return InvalidFolderNameError when the name is shorter than 3 characters', {
    tags: ['rename-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    await folderRepository.create(folder)

    const response = await sut.execute({
      folderId: folder.id.toString(),
      name: 'vi',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidFolderNameError)
  })

  it('should return InvalidFolderNameError when the name is longer than 32 characters', {
    tags: ['rename-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    await folderRepository.create(folder)

    const response = await sut.execute({
      folderId: folder.id.toString(),
      name: 'a'.repeat(33),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidFolderNameError)
  })

  it('should return FolderAlreadyExistsError when another folder in the same parent already has that name', {
    tags: ['rename-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folderA = makeFolder({
      workspaceId: workspace.id.toString(),
      name: 'Folder A',
    })
    const folderB = makeFolder({
      workspaceId: workspace.id.toString(),
      name: 'Folder B',
    })
    await folderRepository.create(folderA)
    await folderRepository.create(folderB)

    const response = await sut.execute({
      folderId: folderB.id.toString(),
      name: 'Folder A',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(FolderAlreadyExistsError)
  })

  it('should allow renaming a folder to its own current name', {
    tags: ['rename-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({
      workspaceId: workspace.id.toString(),
      name: 'Same Name',
    })
    await folderRepository.create(folder)

    const response = await sut.execute({
      folderId: folder.id.toString(),
      name: 'Same Name',
    })

    expect(response.isRight()).toBe(true)
  })
})
