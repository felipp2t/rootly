import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { makeWorkspaceMember } from '@test/factories/make-workspace-member.ts'
import { InMemoryWorkspaceMemberRepository } from '@test/repositories/in-memory-workspace-member-repository.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { InMemoryWorkspaceRoleRepository } from '@test/repositories/in-memory-workspace-role-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { WorkspaceRole } from '../../enterprise/entities/workspace-role.ts'
import { AssignRoleToMemberUseCase } from './assign-role-to-member.ts'

let workspaceMemberRepository: InMemoryWorkspaceMemberRepository
let workspaceRepository: InMemoryWorkspaceRepository
let workspaceRoleRepository: InMemoryWorkspaceRoleRepository
let sut: AssignRoleToMemberUseCase

describe('AssignRoleToMember', () => {
  beforeEach(() => {
    workspaceMemberRepository = new InMemoryWorkspaceMemberRepository()
    workspaceRepository = new InMemoryWorkspaceRepository()
    workspaceRoleRepository = new InMemoryWorkspaceRoleRepository()
    sut = new AssignRoleToMemberUseCase(
      workspaceMemberRepository,
      workspaceRepository,
      workspaceRoleRepository,
    )
  })

  it('should be able to assign a new role to a member', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const oldRole = WorkspaceRole.create({
      name: 'Viewer',
      workspaceId: workspace.id.toString(),
    })
    const newRole = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(oldRole, newRole)

    const member = makeWorkspaceMember({
      userId: makeUser().id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: oldRole.id.toString(),
    })
    workspaceMemberRepository.items.push(member)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      memberId: member.id.toString(),
      roleId: newRole.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toBeNull()
    expect(workspaceMemberRepository.items[0].roleId).toBe(
      newRole.id.toString(),
    )
  })

  it('should return ResourceNotFoundError when the workspace does not exist', async () => {
    const response = await sut.execute({
      userId: makeUser().id.toString(),
      workspaceId: 'non-existent-workspace-id',
      memberId: 'any-member-id',
      roleId: 'any-role-id',
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
      roleId: 'any-role-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the member does not exist', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      memberId: 'non-existent-member-id',
      roleId: role.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the member belongs to a different workspace', async () => {
    const user = makeUser()
    const workspaceA = makeWorkspace({ userId: user.id.toString() })
    const workspaceB = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspaceA, workspaceB)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspaceA.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    const member = makeWorkspaceMember({
      userId: makeUser().id.toString(),
      workspaceId: workspaceB.id.toString(),
      roleId: role.id.toString(),
    })
    workspaceMemberRepository.items.push(member)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspaceA.id.toString(),
      memberId: member.id.toString(),
      roleId: role.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the role does not exist', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const member = makeWorkspaceMember({
      userId: makeUser().id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: 'some-role-id',
    })
    workspaceMemberRepository.items.push(member)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      memberId: member.id.toString(),
      roleId: 'non-existent-role-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should tag the role-changed event with the caller as actorId', async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const oldRole = WorkspaceRole.create({
      name: 'Viewer',
      workspaceId: workspace.id.toString(),
    })
    const newRole = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(oldRole, newRole)

    const member = makeWorkspaceMember({
      userId: makeUser().id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: oldRole.id.toString(),
    })
    workspaceMemberRepository.items.push(member)

    await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      memberId: member.id.toString(),
      roleId: newRole.id.toString(),
    })

    const event = member.domainEvents.at(-1)
    expect(event).toMatchObject({ actorId: user.id.toString() })
  })

  it('should return ResourceNotFoundError when the role belongs to a different workspace', async () => {
    const user = makeUser()
    const workspaceA = makeWorkspace({ userId: user.id.toString() })
    const workspaceB = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspaceA, workspaceB)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspaceB.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    const member = makeWorkspaceMember({
      userId: makeUser().id.toString(),
      workspaceId: workspaceA.id.toString(),
      roleId: 'some-role-id',
    })
    workspaceMemberRepository.items.push(member)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspaceA.id.toString(),
      memberId: member.id.toString(),
      roleId: role.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
