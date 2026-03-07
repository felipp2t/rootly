import { makeFolder } from '@test/factories/make-folder.ts'
import { makeItem } from '@test/factories/make-item.ts'
import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryItemRepository } from '@test/repositories/in-memory-item-repository.ts'
import { GetItemsUseCase } from './get-items.ts'

let itemRepository: InMemoryItemRepository
let sut: GetItemsUseCase

describe('GetItems', () => {
  beforeEach(() => {
    itemRepository = new InMemoryItemRepository()
    sut = new GetItemsUseCase(itemRepository)
  })

  it('should return items inside a folder', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })

    const itemA = makeItem({
      workspaceId: workspace.id.toString(),
      folderId: folder.id.toString(),
    })
    const itemB = makeItem({
      workspaceId: workspace.id.toString(),
      folderId: folder.id.toString(),
    })

    await itemRepository.create(itemA)
    await itemRepository.create(itemB)

    const response = await sut.execute({ parentId: folder.id.toString() })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(2)
      expect(response.value.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            props: expect.objectContaining({ folderId: folder.id.toString() }),
          }),
        ]),
      )
    }
  })

  it('should return only items belonging to the given folder', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folderA = makeFolder({ workspaceId: workspace.id.toString() })
    const folderB = makeFolder({ workspaceId: workspace.id.toString() })

    const itemInA = makeItem({
      workspaceId: workspace.id.toString(),
      folderId: folderA.id.toString(),
    })
    const itemInB = makeItem({
      workspaceId: workspace.id.toString(),
      folderId: folderB.id.toString(),
    })

    await itemRepository.create(itemInA)
    await itemRepository.create(itemInB)

    const response = await sut.execute({ parentId: folderA.id.toString() })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(1)
      expect(response.value.items[0].folderId).toBe(folderA.id.toString())
    }
  })

  it('should return all items when parentId is not provided', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })

    const rootItem = makeItem({ workspaceId: workspace.id.toString() })
    const folderItem = makeItem({
      workspaceId: workspace.id.toString(),
      folderId: folder.id.toString(),
    })

    await itemRepository.create(rootItem)
    await itemRepository.create(folderItem)

    const response = await sut.execute({})

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(2)
    }
  })

  it('should return an empty list when folder has no items', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })

    const response = await sut.execute({ parentId: folder.id.toString() })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(0)
    }
  })
})
