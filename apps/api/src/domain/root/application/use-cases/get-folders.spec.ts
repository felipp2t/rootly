import { makeFolder } from '@test/factories/make-folder.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryFolderRepository } from '@test/repositories/in-memory-folder-repository.ts'
import { GetFoldersUseCase } from './get-folders.ts'

let folderRepository: InMemoryFolderRepository
let sut: GetFoldersUseCase

describe('GetFolders', () => {
  beforeEach(() => {
    folderRepository = new InMemoryFolderRepository()
    sut = new GetFoldersUseCase(folderRepository)
  })

  it('should return all folders when no parentId is provided', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    await folderRepository.create(
      makeFolder({ workspaceId: workspace.id.toString() }),
    )
    await folderRepository.create(
      makeFolder({ workspaceId: workspace.id.toString() }),
    )
    await folderRepository.create(
      makeFolder({ workspaceId: workspace.id.toString() }),
    )

    const response = await sut.execute({})

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.folders).toHaveLength(3)
    }
  })

  it('should return only subfolders of a given parentId', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    const parent = makeFolder({ workspaceId: workspace.id.toString() })
    await folderRepository.create(parent)

    await folderRepository.create(
      makeFolder({
        workspaceId: workspace.id.toString(),
        parentId: parent.id.toString(),
      }),
    )
    await folderRepository.create(
      makeFolder({
        workspaceId: workspace.id.toString(),
        parentId: parent.id.toString(),
      }),
    )

    const response = await sut.execute({ parentId: parent.id.toString() })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.folders).toHaveLength(2)
      expect(
        response.value.folders.every(
          (f) => f.parentId === parent.id.toString(),
        ),
      ).toBe(true)
    }
  })

  it('should not return folders from a different parent', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    const parentA = makeFolder({ workspaceId: workspace.id.toString() })
    const parentB = makeFolder({ workspaceId: workspace.id.toString() })
    await folderRepository.create(parentA)
    await folderRepository.create(parentB)

    await folderRepository.create(
      makeFolder({
        workspaceId: workspace.id.toString(),
        parentId: parentA.id.toString(),
      }),
    )
    await folderRepository.create(
      makeFolder({
        workspaceId: workspace.id.toString(),
        parentId: parentB.id.toString(),
      }),
    )

    const response = await sut.execute({ parentId: parentA.id.toString() })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.folders).toHaveLength(1)
      expect(response.value.folders[0].parentId).toBe(parentA.id.toString())
    }
  })

  it('should return an empty list when parentId has no subfolders', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    const folder = makeFolder({ workspaceId: workspace.id.toString() })
    await folderRepository.create(folder)

    const response = await sut.execute({ parentId: folder.id.toString() })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.folders).toHaveLength(0)
    }
  })

  it('should return an empty list when there are no folders', async () => {
    const response = await sut.execute({})

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.folders).toHaveLength(0)
    }
  })
})
