import { makeFolder } from '@test/factories/make-folder.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryFolderRepository } from '@test/repositories/in-memory-folder-repository.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { InvalidFolderPathError } from './errors/invalid-folder-path-error.ts'
import { ResolveFolderPathUseCase } from './resolve-folder-path.ts'

let folderRepository: InMemoryFolderRepository
let workspaceRepository: InMemoryWorkspaceRepository
let sut: ResolveFolderPathUseCase

describe('ResolveFolderPath', () => {
  beforeEach(() => {
    folderRepository = new InMemoryFolderRepository()
    workspaceRepository = new InMemoryWorkspaceRepository()
    sut = new ResolveFolderPathUseCase(folderRepository, workspaceRepository)
  })

  it('should return an empty path when pathIds is empty', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    await workspaceRepository.create(workspace)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      pathIds: [],
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.path).toEqual([])
    }
  })

  it('should resolve a valid single-level path', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    await workspaceRepository.create(workspace)

    const folder = makeFolder({
      workspaceId: workspace.id.toString(),
      name: 'docs',
    })
    await folderRepository.create(folder)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      pathIds: [folder.id.toString()],
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.path).toEqual([
        { id: folder.id.toString(), name: 'docs' },
      ])
    }
  })

  it('should resolve a valid nested path preserving order', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    await workspaceRepository.create(workspace)

    const a = makeFolder({ workspaceId: workspace.id.toString(), name: 'a' })
    await folderRepository.create(a)

    const b = makeFolder({
      workspaceId: workspace.id.toString(),
      name: 'b',
      parentId: a.id.toString(),
    })
    await folderRepository.create(b)

    const c = makeFolder({
      workspaceId: workspace.id.toString(),
      name: 'c',
      parentId: b.id.toString(),
    })
    await folderRepository.create(c)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      pathIds: [a.id.toString(), b.id.toString(), c.id.toString()],
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.path).toEqual([
        { id: a.id.toString(), name: 'a' },
        { id: b.id.toString(), name: 'b' },
        { id: c.id.toString(), name: 'c' },
      ])
    }
  })

  it('should return ResourceNotFoundError when workspace is not accessible to user', async () => {
    const otherUser = makeUser()
    const workspace = makeWorkspace({ userId: otherUser.id.toString() })
    await workspaceRepository.create(workspace)

    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    await folderRepository.create(folder)

    const intruder = makeUser()
    const response = await sut.execute({
      userId: intruder.id.toString(),
      workspaceId: workspace.id.toString(),
      pathIds: [folder.id.toString()],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return InvalidFolderPathError when one of the ids does not exist', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    await workspaceRepository.create(workspace)

    const a = makeFolder({ workspaceId: workspace.id.toString() })
    await folderRepository.create(a)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      pathIds: [a.id.toString(), 'missing-id'],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidFolderPathError)
  })

  it('should return InvalidFolderPathError when a folder belongs to a different workspace', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const otherWorkspace = makeWorkspace({ userId: user.id.toString() })
    await workspaceRepository.create(workspace)
    await workspaceRepository.create(otherWorkspace)

    const intruder = makeFolder({ workspaceId: otherWorkspace.id.toString() })
    await folderRepository.create(intruder)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      pathIds: [intruder.id.toString()],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidFolderPathError)
  })

  it('should return InvalidFolderPathError when the first folder has a parent (not root)', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    await workspaceRepository.create(workspace)

    const root = makeFolder({ workspaceId: workspace.id.toString() })
    await folderRepository.create(root)

    const child = makeFolder({
      workspaceId: workspace.id.toString(),
      parentId: root.id.toString(),
    })
    await folderRepository.create(child)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      pathIds: [child.id.toString()],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidFolderPathError)
  })

  it('should return InvalidFolderPathError when the chain is broken (B is not child of A)', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    await workspaceRepository.create(workspace)

    const a = makeFolder({ workspaceId: workspace.id.toString() })
    await folderRepository.create(a)

    const b = makeFolder({ workspaceId: workspace.id.toString() })
    await folderRepository.create(b)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      pathIds: [a.id.toString(), b.id.toString()],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InvalidFolderPathError)
  })
})
