import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { makeWorkspaceMember } from '@test/factories/make-workspace-member.ts'
import { InMemoryWorkspaceMemberRepository } from '@test/repositories/in-memory-workspace-member-repository.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { GetWorkspacesUseCase } from './get-workspaces.ts'

let workspaceRepository: InMemoryWorkspaceRepository
let workspaceMemberRepository: InMemoryWorkspaceMemberRepository
let sut: GetWorkspacesUseCase

describe('GetWorkspaces', () => {
  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository()
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
})
