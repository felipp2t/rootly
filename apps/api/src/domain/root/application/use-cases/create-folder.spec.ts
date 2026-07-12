import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryFolderRepository } from '@test/repositories/in-memory-folder-repository.ts'
import { UniqueConstraintViolationError } from '@/core/errors/unique-constraint-violation-error.ts'
import { Folder } from '../../enterprise/entities/folder.ts'
import { CreateFolderUseCase } from './create-folder.ts'
import { FolderAlreadyExistsError } from './errors/folder-already-exists-error.ts'
import { InvalidFolderNameError } from './errors/invalid-folder-name-error.ts'

let folderRepository: InMemoryFolderRepository
let sut: CreateFolderUseCase

describe('CreateFolder', () => {
  beforeEach(() => {
    folderRepository = new InMemoryFolderRepository()
    sut = new CreateFolderUseCase(folderRepository)
  })

  it('should be able create a folder', {
    tags: ['create-folder'],
  }, async () => {
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

  it('should not be able to create a folder with the same name in the same parent folder', {
    tags: ['create-folder'],
  }, async () => {
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

  it('should not be possible to create a folder with fewer than 3 characters', {
    tags: ['create-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const response = await sut.execute({
      name: 'vi',
      workspaceId: workspace.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidFolderNameError)
  })

  it('should not be possible to create a folder with more than 32 characters', {
    tags: ['create-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const response = await sut.execute({
      name: 'a'.repeat(33),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidFolderNameError)
  })

  it('should be able create a folder with 32 characters', {
    tags: ['create-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const response = await sut.execute({
      name: 'a'.repeat(32),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ folderId: expect.any(String) })
  })

  it('should be able create a folder into a parent folder', {
    tags: ['create-folder'],
  }, async () => {
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

  it('should be able to create a folder with the same name in different parent folders of the same workspace', {
    tags: ['create-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const parentA = Folder.create({
      name: 'Parent A',
      workspaceId: workspace.id.toString(),
    })
    const parentB = Folder.create({
      name: 'Parent B',
      workspaceId: workspace.id.toString(),
    })
    await folderRepository.create(parentA)
    await folderRepository.create(parentB)

    await sut.execute({
      name: 'Shared Name',
      parentId: parentA.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    const response = await sut.execute({
      name: 'Shared Name',
      parentId: parentB.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ folderId: expect.any(String) })
  })

  it('should be able to create a folder with the same name in different workspaces', {
    tags: ['create-folder'],
  }, async () => {
    const user = makeUser()
    const workspaceA = makeWorkspace({ userId: user.id.toString() })
    const workspaceB = makeWorkspace({ userId: user.id.toString() })

    await sut.execute({
      name: 'Shared Name',
      workspaceId: workspaceA.id.toString(),
    })

    const response = await sut.execute({
      name: 'Shared Name',
      workspaceId: workspaceB.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ folderId: expect.any(String) })
  })

  it('should return FolderAlreadyExistsError when create() throws UniqueConstraintViolationError (race condition)', {
    tags: ['create-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    vi.spyOn(folderRepository, 'create').mockRejectedValueOnce(
      new UniqueConstraintViolationError('folders_unique_name_per_parent'),
    )

    const response = await sut.execute({
      name: 'Any Folder',
      workspaceId: workspace.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(FolderAlreadyExistsError)
  })

  it('should rethrow non-unique-constraint errors from create()', {
    tags: ['create-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    vi.spyOn(folderRepository, 'create').mockRejectedValueOnce(
      new Error('Unexpected database error'),
    )

    await expect(
      sut.execute({
        name: 'Any Folder',
        workspaceId: workspace.id.toString(),
      }),
    ).rejects.toThrow('Unexpected database error')
  })

  it('should tag the created folder with the provided actorId', {
    tags: ['create-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    await sut.execute({
      name: 'Test Folder',
      workspaceId: workspace.id.toString(),
      actorId: 'user-1',
    })

    const event = folderRepository.items[0].domainEvents[0]
    expect(event).toMatchObject({ actorId: 'user-1' })
  })
})
