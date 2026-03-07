import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryFolderRepository } from '@test/repositories/in-memory-folder-repository.ts'
import { Folder } from '../../enterprise/entities/folder.ts'
import { FolderAlreadyExistsError } from './_errors/folder-already-exists-error.ts'
import { InvalidFolderNameError } from './_errors/invalid-folder-name-error.ts'
import { CreateFolderUseCase } from './create-folder.ts'

let folderRepository: InMemoryFolderRepository
let sut: CreateFolderUseCase

describe('CreateFolder', () => {
  beforeEach(() => {
    folderRepository = new InMemoryFolderRepository()
    sut = new CreateFolderUseCase(folderRepository)
  })

  it('should be able create a folder', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    const response = await sut.execute({
      name: 'Test Folder',
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ folderId: expect.any(String) })
    expect(folderRepository.items.length).toBe(1)
  })

  it('should not be able to create a folder with the same name in the same parent folder', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const parentFolder = Folder.create({
      name: 'Parent Folder',
      workspaceId: workspace.id.toString(),
    })

    await folderRepository.create(parentFolder)

    const response = await sut.execute({
      name: 'Parent Folder',
      workspaceId: workspace.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(FolderAlreadyExistsError)
  })

  it('should not be possible to create a folder with fewer than 3 characters', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const response = await sut.execute({
      name: 'vi',
      workspaceId: workspace.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidFolderNameError)
  })

  it('should not be possible to create a folder with more than 32 characters', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const response = await sut.execute({
      name: 'a'.repeat(33),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidFolderNameError)
  })

  it('should be able create a folder with 32 characters', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const response = await sut.execute({
      name: 'a'.repeat(32),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ folderId: expect.any(String) })
  })

  it('should be able create a folder into a parent folder', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const parentFolder = Folder.create({
      name: 'Parent Folder',
      workspaceId: workspace.id.toString(),
    })
    await folderRepository.create(parentFolder)

    const response = await sut.execute({
      name: 'Child Folder',
      parentId: parentFolder.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    expect(response.value).toMatchObject({ folderId: expect.any(String) })
    expect(folderRepository.items.length).toBe(2)
    expect(folderRepository.items[1].parentId).toEqual(
      folderRepository.items[0].id.toString(),
    )
  })
})
