import { makeItem } from '@test/factories/make-item.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { makeWorkspaceMember } from '@test/factories/make-workspace-member.ts'
import { InMemoryItemRepository } from '@test/repositories/in-memory-item-repository.ts'
import { InMemoryWorkspaceMemberRepository } from '@test/repositories/in-memory-workspace-member-repository.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { GetWorkspacesUseCase } from './get-workspaces.ts'

let itemRepository: InMemoryItemRepository
let workspaceRepository: InMemoryWorkspaceRepository
let workspaceMemberRepository: InMemoryWorkspaceMemberRepository
let sut: GetWorkspacesUseCase

describe('GetWorkspaces', () => {
  beforeEach(() => {
    itemRepository = new InMemoryItemRepository()
    workspaceRepository = new InMemoryWorkspaceRepository(itemRepository)
    workspaceMemberRepository = new InMemoryWorkspaceMemberRepository()
    sut = new GetWorkspacesUseCase(
      workspaceRepository,
      workspaceMemberRepository,
    )
  })

  it('should return all workspaces the user is a member of', async () => {
    const userId = new UniqueEntityID().toString()
    const roleId = new UniqueEntityID().toString()

    const workspaceA = makeWorkspace({ userId })
    const workspaceB = makeWorkspace({ userId })
    workspaceRepository.items.push(workspaceA)
    workspaceRepository.items.push(workspaceB)

    workspaceMemberRepository.items.push(
      makeWorkspaceMember({
        userId,
        workspaceId: workspaceA.id.toString(),
        roleId,
      }),
    )
    workspaceMemberRepository.items.push(
      makeWorkspaceMember({
        userId,
        workspaceId: workspaceB.id.toString(),
        roleId,
      }),
    )

    const response = await sut.execute({ userId })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.workspaces).toHaveLength(2)
    }
  })

  it('should return only workspaces the user is a member of, not all workspaces', async () => {
    const userId = new UniqueEntityID().toString()
    const otherUserId = new UniqueEntityID().toString()
    const roleId = new UniqueEntityID().toString()

    const userWorkspace = makeWorkspace({ userId })
    const otherWorkspace = makeWorkspace({ userId: otherUserId })
    workspaceRepository.items.push(userWorkspace)
    workspaceRepository.items.push(otherWorkspace)

    workspaceMemberRepository.items.push(
      makeWorkspaceMember({
        userId,
        workspaceId: userWorkspace.id.toString(),
        roleId,
      }),
    )

    const response = await sut.execute({ userId })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.workspaces).toHaveLength(1)
      expect(response.value.workspaces[0].id.toString()).toBe(
        userWorkspace.id.toString(),
      )
    }
  })

  it('should return an empty list when the user has no workspace memberships', async () => {
    const userId = new UniqueEntityID().toString()

    const response = await sut.execute({ userId })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.workspaces).toHaveLength(0)
    }
  })

  it('should return itemCount reflecting the number of items in each workspace', async () => {
    const userId = new UniqueEntityID().toString()
    const roleId = new UniqueEntityID().toString()

    const workspaceA = makeWorkspace({ userId })
    const workspaceB = makeWorkspace({ userId })
    workspaceRepository.items.push(workspaceA)
    workspaceRepository.items.push(workspaceB)

    workspaceMemberRepository.items.push(
      makeWorkspaceMember({
        userId,
        workspaceId: workspaceA.id.toString(),
        roleId,
      }),
    )
    workspaceMemberRepository.items.push(
      makeWorkspaceMember({
        userId,
        workspaceId: workspaceB.id.toString(),
        roleId,
      }),
    )

    itemRepository.items.push(
      makeItem({ workspaceId: workspaceA.id.toString() }),
      makeItem({ workspaceId: workspaceA.id.toString() }),
      makeItem({ workspaceId: workspaceA.id.toString() }),
    )

    const response = await sut.execute({ userId })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      const returnedA = response.value.workspaces.find(
        (w) => w.id.toString() === workspaceA.id.toString(),
      )
      const returnedB = response.value.workspaces.find(
        (w) => w.id.toString() === workspaceB.id.toString(),
      )

      expect(returnedA?.itemCount).toBe(3)
      expect(returnedB?.itemCount).toBe(0)
    }
  })

  it('should return itemCount of 0 for a workspace with no items', async () => {
    const userId = new UniqueEntityID().toString()
    const roleId = new UniqueEntityID().toString()

    const workspace = makeWorkspace({ userId })
    workspaceRepository.items.push(workspace)

    workspaceMemberRepository.items.push(
      makeWorkspaceMember({
        userId,
        workspaceId: workspace.id.toString(),
        roleId,
      }),
    )

    const response = await sut.execute({ userId })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.workspaces[0].itemCount).toBe(0)
    }
  })
})
