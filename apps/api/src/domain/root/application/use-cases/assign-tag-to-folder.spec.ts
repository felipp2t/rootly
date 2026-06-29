import { makeFolder } from '@test/factories/make-folder.ts'
import { makeTag } from '@test/factories/make-tag.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryFolderRepository } from '@test/repositories/in-memory-folder-repository.ts'
import { InMemoryTagRepository } from '@test/repositories/in-memory-tag-repository.ts'
import { AssignTagToFolderUseCase } from './assign-tag-to-folder.ts'
import { FolderNotFoundError } from './errors/folder-not-found-error.ts'
import { FolderTagLimitReachedError } from './errors/folder-tag-limit-reached-error.ts'
import { TagNotFoundError } from './errors/tag-not-found-error.ts'

let folderRepository: InMemoryFolderRepository
let tagRepository: InMemoryTagRepository
let sut: AssignTagToFolderUseCase

describe('AssignTagToFolder', () => {
  beforeEach(() => {
    folderRepository = new InMemoryFolderRepository()
    tagRepository = new InMemoryTagRepository()
    sut = new AssignTagToFolderUseCase(folderRepository, tagRepository)
  })

  it('should be able to assign a tag to a folder', {
    tags: ['assign-tag-to-folder'],
  }, async () => {
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
    expect(folderRepository.items[0].tagIds).toContain(tag.id.toString())
  })

  it('should be able to assign multiple tags to a folder', {
    tags: ['assign-tag-to-folder'],
  }, async () => {
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

    expect(folderRepository.items[0].tagIds).toHaveLength(2)
    expect(folderRepository.items[0].tagIds).toContain(tagA.id.toString())
    expect(folderRepository.items[0].tagIds).toContain(tagB.id.toString())
  })

  it('should be idempotent when assigning the same tag twice', {
    tags: ['assign-tag-to-folder'],
  }, async () => {
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
    expect(folderRepository.items[0].tagIds).toHaveLength(1)
  })

  it('should not be able to assign a tag to a non-existing folder', {
    tags: ['assign-tag-to-folder'],
  }, async () => {
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

  it('should not be able to assign more than 3 tags to a folder', {
    tags: ['assign-tag-to-folder'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    const tags = Array.from({ length: 4 }, () =>
      makeTag({ workspaceId: workspace.id.toString() }),
    )

    await folderRepository.create(folder)
    for (const tag of tags) await tagRepository.create(tag)

    await sut.execute({
      folderId: folder.id.toString(),
      tagId: tags[0].id.toString(),
    })
    await sut.execute({
      folderId: folder.id.toString(),
      tagId: tags[1].id.toString(),
    })
    await sut.execute({
      folderId: folder.id.toString(),
      tagId: tags[2].id.toString(),
    })

    const response = await sut.execute({
      folderId: folder.id.toString(),
      tagId: tags[3].id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(FolderTagLimitReachedError)
  })

  it('should not be able to assign a non-existing tag to a folder', {
    tags: ['assign-tag-to-folder'],
  }, async () => {
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
