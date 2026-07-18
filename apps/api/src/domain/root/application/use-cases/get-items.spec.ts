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

  it('should return items from user workspaces when no parentId is provided', {
    tags: ['get-items'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    itemRepository.workspaceMembers.push({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    await itemRepository.create(
      makeItem({ workspaceId: workspace.id.toString() }),
    )
    await itemRepository.create(
      makeItem({ workspaceId: workspace.id.toString() }),
    )

    const response = await sut.execute({ userId: user.id.toString() })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(2)
    }
  })

  it('should not return items from workspaces the user does not belong to', {
    tags: ['get-items'],
  }, async () => {
    const user = makeUser()
    const otherUser = makeUser()

    const userWorkspace = makeWorkspace({ userId: user.id.toString() })
    const otherWorkspace = makeWorkspace({ userId: otherUser.id.toString() })

    itemRepository.workspaceMembers.push({
      userId: user.id.toString(),
      workspaceId: userWorkspace.id.toString(),
    })

    await itemRepository.create(
      makeItem({ workspaceId: userWorkspace.id.toString() }),
    )
    await itemRepository.create(
      makeItem({ workspaceId: otherWorkspace.id.toString() }),
    )

    const response = await sut.execute({ userId: user.id.toString() })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(1)
      expect(response.value.items[0].workspaceId).toBe(
        userWorkspace.id.toString(),
      )
    }
  })

  it('should return items inside a folder', {
    tags: ['get-items'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })

    itemRepository.workspaceMembers.push({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    await itemRepository.create(
      makeItem({
        workspaceId: workspace.id.toString(),
        folderId: folder.id.toString(),
      }),
    )
    await itemRepository.create(
      makeItem({
        workspaceId: workspace.id.toString(),
        folderId: folder.id.toString(),
      }),
    )

    const response = await sut.execute({
      userId: user.id.toString(),
      parentId: folder.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(2)
      expect(
        response.value.items.every((i) => i.folderId === folder.id.toString()),
      ).toBe(true)
    }
  })

  it('should return only items belonging to the given folder', {
    tags: ['get-items'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folderA = makeFolder({ workspaceId: workspace.id.toString() })
    const folderB = makeFolder({ workspaceId: workspace.id.toString() })

    itemRepository.workspaceMembers.push({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    await itemRepository.create(
      makeItem({
        workspaceId: workspace.id.toString(),
        folderId: folderA.id.toString(),
      }),
    )
    await itemRepository.create(
      makeItem({
        workspaceId: workspace.id.toString(),
        folderId: folderB.id.toString(),
      }),
    )

    const response = await sut.execute({
      userId: user.id.toString(),
      parentId: folderA.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(1)
      expect(response.value.items[0].folderId).toBe(folderA.id.toString())
    }
  })

  it('should return an empty list when folder has no items', {
    tags: ['get-items'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })

    itemRepository.workspaceMembers.push({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    const response = await sut.execute({
      userId: user.id.toString(),
      parentId: folder.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(0)
    }
  })

  it('should return an empty list when user has no workspace memberships', {
    tags: ['get-items'],
  }, async () => {
    const user = makeUser()

    const response = await sut.execute({ userId: user.id.toString() })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(0)
    }
  })

  it('should return only root items of a workspace when workspaceId is provided', {
    tags: ['get-items'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    const folder = makeFolder({ workspaceId: workspace.id.toString() })

    itemRepository.workspaceMembers.push({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    await itemRepository.create(
      makeItem({ workspaceId: workspace.id.toString() }),
    )
    await itemRepository.create(
      makeItem({
        workspaceId: workspace.id.toString(),
        folderId: folder.id.toString(),
      }),
    )

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(1)
      expect(response.value.items[0].folderId).toBeUndefined()
    }
  })

  it('should not return items from other workspaces when workspaceId is provided', {
    tags: ['get-items'],
  }, async () => {
    const user = makeUser()
    const workspaceA = makeWorkspace({ userId: user.id.toString() })
    const workspaceB = makeWorkspace({ userId: user.id.toString() })

    itemRepository.workspaceMembers.push(
      { userId: user.id.toString(), workspaceId: workspaceA.id.toString() },
      { userId: user.id.toString(), workspaceId: workspaceB.id.toString() },
    )

    await itemRepository.create(
      makeItem({ workspaceId: workspaceA.id.toString() }),
    )
    await itemRepository.create(
      makeItem({ workspaceId: workspaceB.id.toString() }),
    )

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspaceA.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(1)
      expect(response.value.items[0].workspaceId).toBe(workspaceA.id.toString())
    }
  })

  it('should exclude archived items by default', {
    tags: ['get-items'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    itemRepository.workspaceMembers.push({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    const activeItem = makeItem({ workspaceId: workspace.id.toString() })
    const archivedItem = makeItem({ workspaceId: workspace.id.toString() })
    archivedItem.archive()

    await itemRepository.create(activeItem)
    await itemRepository.create(archivedItem)

    const response = await sut.execute({ userId: user.id.toString() })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(1)
      expect(response.value.items[0].id.toString()).toBe(
        activeItem.id.toString(),
      )
    }
  })

  it('should include archived items when includeArchived is true', {
    tags: ['get-items'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    itemRepository.workspaceMembers.push({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    const activeItem = makeItem({ workspaceId: workspace.id.toString() })
    const archivedItem = makeItem({ workspaceId: workspace.id.toString() })
    archivedItem.archive()

    await itemRepository.create(activeItem)
    await itemRepository.create(archivedItem)

    const response = await sut.execute({
      userId: user.id.toString(),
      includeArchived: true,
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(2)
    }
  })

  it('should paginate results and expose pagination metadata', {
    tags: ['get-items'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })

    itemRepository.workspaceMembers.push({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    for (let i = 0; i < 3; i++) {
      await itemRepository.create(
        makeItem({ workspaceId: workspace.id.toString() }),
      )
    }

    const response = await sut.execute({
      userId: user.id.toString(),
      page: 1,
      limit: 2,
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.items).toHaveLength(2)
      expect(response.value.total).toBe(3)
      expect(response.value.page).toBe(1)
      expect(response.value.limit).toBe(2)
      expect(response.value.totalPages).toBe(2)
    }
  })
})
