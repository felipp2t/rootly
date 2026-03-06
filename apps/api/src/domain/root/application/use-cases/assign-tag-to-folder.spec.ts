import { makeFolder } from '@test/factories/make-folder.ts'
import { makeTag } from '@test/factories/make-tag.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryFolderRepository } from '@test/repositories/in-memory-folder-repository.ts'
import { InMemoryTagRepository } from '@test/repositories/in-memory-tag-repository.ts'
import { FolderNotFoundError } from './_errors/folder-not-found-error.ts'
import { TagNotFoundError } from './_errors/tag-not-found-error.ts'
import { AssignTagToFolderUseCase } from './assign-tag-to-folder.ts'

let folderRepository: InMemoryFolderRepository
let tagRepository: InMemoryTagRepository
let sut: AssignTagToFolderUseCase

describe('AssignTagToFolder', () => {
  beforeEach(() => {
    folderRepository = new InMemoryFolderRepository()
    tagRepository = new InMemoryTagRepository()
    sut = new AssignTagToFolderUseCase(folderRepository, tagRepository)
  })

  it('should be able to assign a tag to a folder', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    const tag = makeTag({ workspaceId: workspace.id.toString() })

    await folderRepository.create(folder)
    await tagRepository.create(tag)

    const response = await sut.execute({
      folderId: folder.id.toString(),
      tagId: tag.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(folderRepository.folders[0].tagIds).toContain(tag.id.toString())
  })

  it('should be able to assign multiple tags to a folder', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    const tagA = makeTag({ workspaceId: workspace.id.toString() })
    const tagB = makeTag({ workspaceId: workspace.id.toString() })

    await folderRepository.create(folder)
    await tagRepository.create(tagA)
    await tagRepository.create(tagB)

    await sut.execute({
      folderId: folder.id.toString(),
      tagId: tagA.id.toString(),
    })
    await sut.execute({
      folderId: folder.id.toString(),
      tagId: tagB.id.toString(),
    })

    expect(folderRepository.folders[0].tagIds).toHaveLength(2)
    expect(folderRepository.folders[0].tagIds).toContain(tagA.id.toString())
    expect(folderRepository.folders[0].tagIds).toContain(tagB.id.toString())
  })

  it('should be idempotent when assigning the same tag twice', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    const tag = makeTag({ workspaceId: workspace.id.toString() })

    await folderRepository.create(folder)
    await tagRepository.create(tag)

    await sut.execute({
      folderId: folder.id.toString(),
      tagId: tag.id.toString(),
    })
    const response = await sut.execute({
      folderId: folder.id.toString(),
      tagId: tag.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(folderRepository.folders[0].tagIds).toHaveLength(1)
  })

  it('should not be able to assign a tag to a non-existing folder', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const tag = makeTag({ workspaceId: workspace.id.toString() })

    await tagRepository.create(tag)

    const response = await sut.execute({
      folderId: 'non-existing-folder-id',
      tagId: tag.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(FolderNotFoundError)
  })

  it('should not be able to assign a non-existing tag to a folder', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })

    await folderRepository.create(folder)

    const response = await sut.execute({
      folderId: folder.id.toString(),
      tagId: 'non-existing-tag-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(TagNotFoundError)
  })
})
