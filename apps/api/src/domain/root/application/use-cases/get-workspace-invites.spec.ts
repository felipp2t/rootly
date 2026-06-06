import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { makeWorkspaceInvite } from '@test/factories/make-workspace-invite.ts'
import { InMemoryRolePermissionRepository } from '@test/repositories/in-memory-role-permission.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { InMemoryWorkspaceInviteRepository } from '@test/repositories/in-memory-workspace-invite-repository.ts'
import { InMemoryWorkspaceMemberRepository } from '@test/repositories/in-memory-workspace-member-repository.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { InMemoryWorkspaceRoleRepository } from '@test/repositories/in-memory-workspace-role-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { workspaceInviteStatus } from '../../enterprise/entities/workspace-invite.ts'
import { WorkspaceRole } from '../../enterprise/entities/workspace-role.ts'
import { GetWorkspaceInvitesUseCase } from './get-workspace-invites.ts'

let workspaceRepository: InMemoryWorkspaceRepository
let workspaceMemberRepository: InMemoryWorkspaceMemberRepository
let rolePermissionRepository: InMemoryRolePermissionRepository
let workspaceInviteRepository: InMemoryWorkspaceInviteRepository
let userRepository: InMemoryUserRepository
let workspaceRoleRepository: InMemoryWorkspaceRoleRepository
let sut: GetWorkspaceInvitesUseCase

describe('GetWorkspaceInvites', () => {
  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository()
    workspaceMemberRepository = new InMemoryWorkspaceMemberRepository()
    rolePermissionRepository = new InMemoryRolePermissionRepository()
    workspaceInviteRepository = new InMemoryWorkspaceInviteRepository()
    userRepository = new InMemoryUserRepository()
    workspaceRoleRepository = new InMemoryWorkspaceRoleRepository()
    sut = new GetWorkspaceInvitesUseCase(
      workspaceRepository,
      workspaceMemberRepository,
      rolePermissionRepository,
      workspaceInviteRepository,
      userRepository,
      workspaceRoleRepository,
    )
  })

  it('should list only pending invites enriched with user and role for the owner', async () => {
    const ownerId = new UniqueEntityID().toString()
    const workspace = makeWorkspace({ userId: ownerId })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      workspaceId: workspace.id.toString(),
      name: 'Developer',
    })
    workspaceRoleRepository.items.push(role)

    const invitedUser = makeUser({ email: 'jane@example.com', name: 'Jane' })
    userRepository.items.push(invitedUser)

    workspaceInviteRepository.items.push(
      makeWorkspaceInvite({
        workspaceId: workspace.id.toString(),
        invitedUserId: invitedUser.id.toString(),
        invitedByUserId: ownerId,
        roleId: role.id.toString(),
        status: workspaceInviteStatus.PENDING,
      }),
    )

    workspaceInviteRepository.items.push(
      makeWorkspaceInvite({
        workspaceId: workspace.id.toString(),
        invitedUserId: new UniqueEntityID().toString(),
        invitedByUserId: ownerId,
        roleId: role.id.toString(),
        status: workspaceInviteStatus.ACCEPTED,
      }),
    )

    const result = await sut.execute({
      userId: ownerId,
      workspaceId: workspace.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.invites).toHaveLength(1)
      expect(result.value.invites[0]).toMatchObject({
        email: 'jane@example.com',
        name: 'Jane',
        roleName: 'Developer',
        status: 'pending',
      })
    }
  })

  it('should return ResourceNotFoundError when the workspace is not accessible', async () => {
    const result = await sut.execute({
      userId: new UniqueEntityID().toString(),
      workspaceId: new UniqueEntityID().toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
