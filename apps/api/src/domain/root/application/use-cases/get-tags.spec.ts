import { makeTag } from '@test/factories/make-tag.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { InMemoryTagRepository } from '@test/repositories/in-memory-tag-repository.ts'
import { GetTagsUseCase } from './get-tags.ts'

let tagRepository: InMemoryTagRepository
let sut: GetTagsUseCase

describe('GetTags', () => {
  beforeEach(() => {
    tagRepository = new InMemoryTagRepository()
    sut = new GetTagsUseCase(tagRepository)
  })

  it('should return all tags from the given workspace', {
    tags: ['get-tags'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    await tagRepository.create(makeTag({ workspaceId: workspace.id.toString() }))
    await tagRepository.create(makeTag({ workspaceId: workspace.id.toString() }))
    await tagRepository.create(makeTag({ workspaceId: workspace.id.toString() }))

    const result = await sut.execute({ workspaceId: workspace.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.tags).toHaveLength(3)
      expect(
        result.value.tags.every((t) => t.workspaceId === workspace.id.toString()),
      ).toBe(true)
    }
  })

  it('should not return tags from other workspaces', {
    tags: ['get-tags'],
  }, async () => {
    const user = makeUser()
    const otherUser = makeUser()

    const workspace = makeWorkspace({ userId: user.id.toString() })
    const otherWorkspace = makeWorkspace({ userId: otherUser.id.toString() })

    await tagRepository.create(makeTag({ workspaceId: workspace.id.toString() }))
    await tagRepository.create(makeTag({ workspaceId: otherWorkspace.id.toString() }))
    await tagRepository.create(makeTag({ workspaceId: otherWorkspace.id.toString() }))

    const result = await sut.execute({ workspaceId: workspace.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.tags).toHaveLength(1)
      expect(result.value.tags[0].workspaceId).toBe(workspace.id.toString())
    }
  })

  it('should return an empty list when the workspace has no tags', {
    tags: ['get-tags'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    const result = await sut.execute({ workspaceId: workspace.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.tags).toHaveLength(0)
    }
  })
})
