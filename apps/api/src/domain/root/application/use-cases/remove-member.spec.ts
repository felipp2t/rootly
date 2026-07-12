import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { makeWorkspaceMember } from '@test/factories/make-workspace-member.ts'
import { InMemoryWorkspaceMemberRepository } from '@test/repositories/in-memory-workspace-member-repository.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { RemoveMemberUseCase } from './remove-member.ts'

let workspaceMemberRepository: InMemoryWorkspaceMemberRepository
let workspaceRepository: InMemoryWorkspaceRepository
let sut: RemoveMemberUseCase

describe('RemoveMember', () => {
  beforeEach(() => {
    workspaceMemberRepository = new InMemoryWorkspaceMemberRepository()
    workspaceRepository = new InMemoryWorkspaceRepository()
    sut = new RemoveMemberUseCase(
      workspaceMemberRepository,
      workspaceRepository,
    )
  })

  it('should be able to remove a member', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const member = makeWorkspaceMember({
      userId: makeUser().id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: 'any-role-id',
    })
    workspaceMemberRepository.items.push(member)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      memberId: member.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toBeNull()
    expect(workspaceMemberRepository.items).toHaveLength(0)
  })

  it('should return ResourceNotFoundError when the workspace does not exist', async () => {
    const response = await sut.execute({
      userId: makeUser().id.toString(),
      workspaceId: 'non-existent-workspace-id',
      memberId: 'any-member-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the workspace belongs to a different user', async () => {
    const owner = makeUser()
    const other = makeUser()
    const workspace = makeWorkspace({ userId: owner.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: other.id.toString(),
      workspaceId: workspace.id.toString(),
      memberId: 'any-member-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the member does not exist', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      memberId: 'non-existent-member-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the member belongs to a different workspace', async () => {
    const user = makeUser()
    const workspaceA = makeWorkspace({ userId: user.id.toString() })
    const workspaceB = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspaceA, workspaceB)

    const member = makeWorkspaceMember({
      userId: makeUser().id.toString(),
      workspaceId: workspaceB.id.toString(),
      roleId: 'any-role-id',
    })
    workspaceMemberRepository.items.push(member)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspaceA.id.toString(),
      memberId: member.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should tag the removed-member event with the caller as actorId', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const member = makeWorkspaceMember({
      userId: makeUser().id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: 'any-role-id',
    })
    workspaceMemberRepository.items.push(member)

    await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      memberId: member.id.toString(),
    })

    const event = member.domainEvents.at(-1)
    expect(event).toMatchObject({ actorId: user.id.toString() })
  })

  it('should return NotAllowedError when trying to remove the workspace owner', async () => {
    const owner = makeUser()
    const workspace = makeWorkspace({ userId: owner.id.toString() })
    workspaceRepository.items.push(workspace)

    const ownerMember = makeWorkspaceMember({
      userId: owner.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: 'any-role-id',
    })
    workspaceMemberRepository.items.push(ownerMember)

    const response = await sut.execute({
      userId: owner.id.toString(),
      workspaceId: workspace.id.toString(),
      memberId: ownerMember.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(NotAllowedError)
    expect(workspaceMemberRepository.items).toHaveLength(1)
  })
})
