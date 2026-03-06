import { makeTag } from '@test/factories/make-tag.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryTagRepository } from '@test/repositories/in-memory-tag-repository.ts'
import { TagAlreadyExistsError } from './_errors/tag-already-exists-error.ts'
import { CreateTagUseCase } from './create-tag.ts'

let tagRepository: InMemoryTagRepository
let sut: CreateTagUseCase

describe('CreateTag', () => {
  beforeEach(() => {
    tagRepository = new InMemoryTagRepository()
    sut = new CreateTagUseCase(tagRepository)
  })

  it('should be able to create a tag', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    const response = await sut.execute({
      name: 'My Tag',
      color: 'blue',
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ tagId: expect.any(String) })
    expect(tagRepository.tags.length).toBe(1)
  })

  it('should not be able to create a tag with the same name in the same workspace', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    const tag = makeTag({
      workspaceId: workspace.id.toString(),
      name: 'My Tag',
    })
    await tagRepository.save(tag)

    const response = await sut.execute({
      name: 'My Tag',
      color: 'green',
      workspaceId: workspace.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(TagAlreadyExistsError)
  })

  it('should be able to create a tag with the same name in a different workspace', async () => {
    const user = makeUser()
    const workspaceA = makeWorkspace({ userId: user.id.toString() })
    const workspaceB = makeWorkspace({ userId: user.id.toString() })

    const tag = makeTag({
      workspaceId: workspaceA.id.toString(),
      name: 'My Tag',
    })
    await tagRepository.save(tag)

    const response = await sut.execute({
      name: 'My Tag',
      color: 'red',
      workspaceId: workspaceB.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(tagRepository.tags.length).toBe(2)
  })

  it('should be able to create tags with different colors', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    const colors = [
      'blue',
      'green',
      'orange',
      'purple',
      'red',
      'yellow',
    ] as const

    for (const color of colors) {
      const response = await sut.execute({
        name: `Tag ${color}`,
        color,
        workspaceId: workspace.id.toString(),
      })

      expect(response.isRight()).toBe(true)
    }

    expect(tagRepository.tags.length).toBe(colors.length)
  })
})
