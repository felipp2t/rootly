import { InMemoryFolderRepository } from '../../../../../test/repositories/in-memory-folder-repository.ts'
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
    const response = await sut.execute({
      name: 'Test Folder',
    })

    expect(response.folderId).toBeTruthy()
    expect(folderRepository.folders.length).toBe(1)
  })

  it('should not be able to create a folder with the same name in the same parent folder', async () => {
    const parentFolder = Folder.create({ name: 'Parent Folder' })

    await folderRepository.save(parentFolder)

    await expect(sut.execute({ name: 'Parent Folder' })).rejects.toBeInstanceOf(
      FolderAlreadyExistsError,
    )
  })

  it('should not be possible to create a folder with fewer than 3 characters', async () => {
    await expect(sut.execute({ name: 'vi' })).rejects.toBeInstanceOf(
      InvalidFolderNameError,
    )
  })

  it('should not be possible to create a folder with more than 32 characters', async () => {
    await expect(sut.execute({ name: 'a'.repeat(33) })).rejects.toBeInstanceOf(
      InvalidFolderNameError,
    )
  })
  
  it('should be possible to create a folder with 32 characters', async () => {
    await expect(sut.execute({ name: 'a'.repeat(32) })).resolves.toBeTruthy()
  })
})
