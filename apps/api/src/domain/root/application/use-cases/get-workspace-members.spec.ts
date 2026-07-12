import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { makeWorkspaceMember } from '@test/factories/make-workspace-member.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { InMemoryWorkspaceMemberRepository } from '@test/repositories/in-memory-workspace-member-repository.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { InMemoryWorkspaceRoleRepository } from '@test/repositories/in-memory-workspace-role-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { WorkspaceRole } from '../../enterprise/entities/workspace-role.ts'
import { GetWorkspaceMembersUseCase } from './get-workspace-members.ts'

let workspaceMemberRepository: InMemoryWorkspaceMemberRepository
let workspaceRepository: InMemoryWorkspaceRepository
let userRepository: InMemoryUserRepository
let workspaceRoleRepository: InMemoryWorkspaceRoleRepository
let sut: GetWorkspaceMembersUseCase

describe('GetWorkspaceMembers', () => {
  beforeEach(() => {
    workspaceMemberRepository = new InMemoryWorkspaceMemberRepository()
    workspaceRepository = new InMemoryWorkspaceRepository()
    userRepository = new InMemoryUserRepository()
    workspaceRoleRepository = new InMemoryWorkspaceRoleRepository()
    sut = new GetWorkspaceMembersUseCase(
      workspaceMemberRepository,
      workspaceRepository,
      userRepository,
      workspaceRoleRepository,
    )
  })

  it('should be able to list members enriched with user and role data', {
    tags: ['get-workspace-members'],
  }, async () => {
    const owner = makeUser()
    const workspace = makeWorkspace({ userId: owner.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    const member = makeUser({ name: 'Jane Doe', email: 'jane@example.com' })
    userRepository.items.push(owner, member)

    workspaceMemberRepository.items.push(
      makeWorkspaceMember({
        userId: member.id.toString(),
        workspaceId: workspace.id.toString(),
        roleId: role.id.toString(),
      }),
    )

    const response = await sut.execute({
      userId: owner.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.members).toHaveLength(1)
      expect(response.value.members[0]).toMatchObject({
        userId: member.id.toString(),
        name: 'Jane Doe',
        email: 'jane@example.com',
        roleId: role.id.toString(),
        roleName: 'Developer',
      })
    }
  })

  it('should only return members of the requested workspace', {
    tags: ['get-workspace-members'],
  }, async () => {
    const owner = makeUser()
    const workspaceA = makeWorkspace({ userId: owner.id.toString() })
    const workspaceB = makeWorkspace({ userId: owner.id.toString() })
    workspaceRepository.items.push(workspaceA, workspaceB)

    const roleA = WorkspaceRole.create({
      name: 'Dev',
      workspaceId: workspaceA.id.toString(),
    })
    const roleB = WorkspaceRole.create({
      name: 'Dev',
      workspaceId: workspaceB.id.toString(),
    })
    workspaceRoleRepository.items.push(roleA, roleB)

    const userA = makeUser()
    const userB = makeUser()
    userRepository.items.push(owner, userA, userB)

    workspaceMemberRepository.items.push(
      makeWorkspaceMember({
        userId: userA.id.toString(),
        workspaceId: workspaceA.id.toString(),
        roleId: roleA.id.toString(),
      }),
      makeWorkspaceMember({
        userId: userB.id.toString(),
        workspaceId: workspaceB.id.toString(),
        roleId: roleB.id.toString(),
      }),
    )

    const response = await sut.execute({
      userId: owner.id.toString(),
      workspaceId: workspaceA.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.members).toHaveLength(1)
      expect(response.value.members[0].userId).toBe(userA.id.toString())
    }
  })

  it('should exclude orphaned members whose user or role no longer resolve', {
    tags: ['get-workspace-members'],
  }, async () => {
    const owner = makeUser()
    const workspace = makeWorkspace({ userId: owner.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    const validMember = makeUser({
      name: 'Jane Doe',
      email: 'jane@example.com',
    })
    userRepository.items.push(owner, validMember)

    workspaceMemberRepository.items.push(
      makeWorkspaceMember({
        userId: validMember.id.toString(),
        workspaceId: workspace.id.toString(),
        roleId: role.id.toString(),
      }),
      makeWorkspaceMember({
        userId: 'non-existent-user-id',
        workspaceId: workspace.id.toString(),
        roleId: role.id.toString(),
      }),
      makeWorkspaceMember({
        userId: validMember.id.toString(),
        workspaceId: workspace.id.toString(),
        roleId: 'non-existent-role-id',
      }),
    )

    const response = await sut.execute({
      userId: owner.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.members).toHaveLength(1)
      expect(response.value.members[0]).toMatchObject({
        userId: validMember.id.toString(),
        roleId: role.id.toString(),
      })
    }
  })

  it('should return an empty array when the workspace has no members', {
    tags: ['get-workspace-members'],
  }, async () => {
    const owner = makeUser()
    const workspace = makeWorkspace({ userId: owner.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: owner.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.members).toHaveLength(0)
    }
  })

  it('should return ResourceNotFoundError when the workspace does not exist', {
    tags: ['get-workspace-members'],
  }, async () => {
    const response = await sut.execute({
      userId: makeUser().id.toString(),
      workspaceId: 'non-existent-workspace-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the workspace belongs to a different user', {
    tags: ['get-workspace-members'],
  }, async () => {
    const owner = makeUser()
    const other = makeUser()
    const workspace = makeWorkspace({ userId: owner.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: other.id.toString(),
      workspaceId: workspace.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
