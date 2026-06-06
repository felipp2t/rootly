import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { makeWorkspaceInvite } from '@test/factories/make-workspace-invite.ts'
import { InMemoryRolePermissionRepository } from '@test/repositories/in-memory-role-permission.ts'
import { InMemoryWorkspaceInviteRepository } from '@test/repositories/in-memory-workspace-invite-repository.ts'
import { InMemoryWorkspaceMemberRepository } from '@test/repositories/in-memory-workspace-member-repository.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { workspaceInviteStatus } from '../../enterprise/entities/workspace-invite.ts'
import { RevokeInviteUseCase } from './revoke-invite.ts'

let workspaceInviteRepository: InMemoryWorkspaceInviteRepository
let workspaceRepository: InMemoryWorkspaceRepository
let workspaceMemberRepository: InMemoryWorkspaceMemberRepository
let rolePermissionRepository: InMemoryRolePermissionRepository
let sut: RevokeInviteUseCase

describe('RevokeInvite', () => {
  beforeEach(() => {
    workspaceInviteRepository = new InMemoryWorkspaceInviteRepository()
    workspaceRepository = new InMemoryWorkspaceRepository()
    workspaceMemberRepository = new InMemoryWorkspaceMemberRepository()
    rolePermissionRepository = new InMemoryRolePermissionRepository()
    sut = new RevokeInviteUseCase(
      workspaceInviteRepository,
      workspaceRepository,
      workspaceMemberRepository,
      rolePermissionRepository,
    )
  })

  function seedOwnedWorkspaceWithInvite(
    status = workspaceInviteStatus.PENDING,
  ) {
    const ownerId = new UniqueEntityID().toString()
    const workspace = makeWorkspace({ userId: ownerId })
    workspaceRepository.items.push(workspace)

    const invite = makeWorkspaceInvite({
      workspaceId: workspace.id.toString(),
      invitedUserId: new UniqueEntityID().toString(),
      invitedByUserId: ownerId,
      roleId: new UniqueEntityID().toString(),
      status,
    })
    workspaceInviteRepository.items.push(invite)

    return { ownerId, invite }
  }

  it('should let the workspace owner revoke a pending invite', async () => {
    const { ownerId, invite } = seedOwnedWorkspaceWithInvite()

    const result = await sut.execute({
      userId: ownerId,
      inviteId: invite.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(workspaceInviteRepository.items[0].status).toBe(
      workspaceInviteStatus.REVOKED,
    )
  })

  it('should return ResourceNotFoundError when the invite does not exist', async () => {
    const result = await sut.execute({
      userId: new UniqueEntityID().toString(),
      inviteId: new UniqueEntityID().toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not allow revoking an invite that is not pending', async () => {
    const { ownerId, invite } = seedOwnedWorkspaceWithInvite(
      workspaceInviteStatus.ACCEPTED,
    )

    const result = await sut.execute({
      userId: ownerId,
      inviteId: invite.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not allow a user without access to revoke', async () => {
    const { invite } = seedOwnedWorkspaceWithInvite()

    const result = await sut.execute({
      userId: new UniqueEntityID().toString(),
      inviteId: invite.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
