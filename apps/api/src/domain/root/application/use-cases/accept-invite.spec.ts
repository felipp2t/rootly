import { makeWorkspaceInvite } from '@test/factories/make-workspace-invite.ts'
import { makeWorkspaceMember } from '@test/factories/make-workspace-member.ts'
import { InMemoryWorkspaceInviteRepository } from '@test/repositories/in-memory-workspace-invite-repository.ts'
import { InMemoryWorkspaceMemberRepository } from '@test/repositories/in-memory-workspace-member-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { workspaceInviteStatus } from '../../enterprise/entities/workspace-invite.ts'
import { AcceptInviteUseCase } from './accept-invite.ts'
import { WorkspaceInviteAlreadyAcceptedError } from './errors/workspace-invite-already-accepted-error.ts'
import { WorkspaceInviteExpiredError } from './errors/workspace-invite-expired-error.ts'

let workspaceInviteRepository: InMemoryWorkspaceInviteRepository
let workspaceMemberRepository: InMemoryWorkspaceMemberRepository
let sut: AcceptInviteUseCase

describe('AcceptInvite', () => {
  beforeEach(() => {
    workspaceInviteRepository = new InMemoryWorkspaceInviteRepository()
    workspaceMemberRepository = new InMemoryWorkspaceMemberRepository()
    sut = new AcceptInviteUseCase(
      workspaceInviteRepository,
      workspaceMemberRepository,
    )
  })

  it('should be able to accept an invite', {
    tags: ['accept-invite'],
  }, async () => {
    const inviteId = new UniqueEntityID()
    const userId = new UniqueEntityID().toString()

    const invite = makeWorkspaceInvite(
      {
        workspaceId: new UniqueEntityID().toString(),
        invitedUserId: userId,
        invitedByUserId: new UniqueEntityID().toString(),
        roleId: new UniqueEntityID().toString(),
      },
      inviteId,
    )

    workspaceInviteRepository.items.push(invite)

    const response = await sut.execute({
      inviteId: inviteId.toString(),
      userId,
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toMatchObject({ workspaceId: expect.any(String) })
  })

  it('should update the invite status to accepted in the repository', {
    tags: ['accept-invite'],
  }, async () => {
    const inviteId = new UniqueEntityID()
    const userId = new UniqueEntityID().toString()

    const invite = makeWorkspaceInvite(
      {
        workspaceId: new UniqueEntityID().toString(),
        invitedUserId: userId,
        invitedByUserId: new UniqueEntityID().toString(),
        roleId: new UniqueEntityID().toString(),
      },
      inviteId,
    )

    workspaceInviteRepository.items.push(invite)

    await sut.execute({
      inviteId: inviteId.toString(),
      userId,
    })

    expect(workspaceInviteRepository.items[0].status).toBe(
      workspaceInviteStatus.ACCEPTED,
    )
  })

  it('should return the workspaceId of the accepted invite', {
    tags: ['accept-invite'],
  }, async () => {
    const inviteId = new UniqueEntityID()
    const userId = new UniqueEntityID().toString()
    const workspaceId = new UniqueEntityID().toString()

    const invite = makeWorkspaceInvite(
      {
        workspaceId,
        invitedUserId: userId,
        invitedByUserId: new UniqueEntityID().toString(),
        roleId: new UniqueEntityID().toString(),
      },
      inviteId,
    )

    workspaceInviteRepository.items.push(invite)

    const response = await sut.execute({
      inviteId: inviteId.toString(),
      userId,
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toEqual({ workspaceId })
  })

  it('should create a workspace member for the accepted invite', {
    tags: ['accept-invite'],
  }, async () => {
    const inviteId = new UniqueEntityID()
    const userId = new UniqueEntityID().toString()
    const workspaceId = new UniqueEntityID().toString()
    const roleId = new UniqueEntityID().toString()

    const invite = makeWorkspaceInvite(
      {
        workspaceId,
        invitedUserId: userId,
        invitedByUserId: new UniqueEntityID().toString(),
        roleId,
      },
      inviteId,
    )

    workspaceInviteRepository.items.push(invite)

    await sut.execute({ inviteId: inviteId.toString(), userId })

    expect(workspaceMemberRepository.items).toHaveLength(1)
    expect(workspaceMemberRepository.items[0]).toMatchObject({
      props: { userId, workspaceId, roleId },
    })
  })

  it('should not create a duplicate workspace member when the user already belongs to the workspace', {
    tags: ['accept-invite'],
  }, async () => {
    const inviteId = new UniqueEntityID()
    const userId = new UniqueEntityID().toString()
    const workspaceId = new UniqueEntityID().toString()
    const roleId = new UniqueEntityID().toString()

    const invite = makeWorkspaceInvite(
      {
        workspaceId,
        invitedUserId: userId,
        invitedByUserId: new UniqueEntityID().toString(),
        roleId,
      },
      inviteId,
    )
    workspaceInviteRepository.items.push(invite)

    workspaceMemberRepository.items.push(
      makeWorkspaceMember({ userId, workspaceId, roleId }),
    )

    const response = await sut.execute({
      inviteId: inviteId.toString(),
      userId,
    })

    expect(response.isRight()).toBe(true)
    expect(workspaceMemberRepository.items).toHaveLength(1)
  })

  it('should return ResourceNotFoundError when the invite does not exist', {
    tags: ['accept-invite'],
  }, async () => {
    const response = await sut.execute({
      inviteId: new UniqueEntityID().toString(),
      userId: new UniqueEntityID().toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return WorkspaceInviteAlreadyAcceptedError when the invite is not pending', {
    tags: ['accept-invite'],
  }, async () => {
    const inviteId = new UniqueEntityID()
    const userId = new UniqueEntityID().toString()

    const invite = makeWorkspaceInvite(
      {
        workspaceId: new UniqueEntityID().toString(),
        invitedUserId: userId,
        invitedByUserId: new UniqueEntityID().toString(),
        roleId: new UniqueEntityID().toString(),
        status: workspaceInviteStatus.ACCEPTED,
      },
      inviteId,
    )

    workspaceInviteRepository.items.push(invite)

    const response = await sut.execute({
      inviteId: inviteId.toString(),
      userId,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(WorkspaceInviteAlreadyAcceptedError)
  })

  it('should return WorkspaceInviteExpiredError when the invite has expired', {
    tags: ['accept-invite'],
  }, async () => {
    const inviteId = new UniqueEntityID()
    const userId = new UniqueEntityID().toString()

    const pastDate = new Date(Date.now() - 1000)

    const invite = makeWorkspaceInvite(
      {
        workspaceId: new UniqueEntityID().toString(),
        invitedUserId: userId,
        invitedByUserId: new UniqueEntityID().toString(),
        roleId: new UniqueEntityID().toString(),
        expiresAt: pastDate,
      },
      inviteId,
    )

    workspaceInviteRepository.items.push(invite)

    const response = await sut.execute({
      inviteId: inviteId.toString(),
      userId,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(WorkspaceInviteExpiredError)
  })

  it('should return NotAllowedError when userId does not match invitedUserId', {
    tags: ['accept-invite'],
  }, async () => {
    const inviteId = new UniqueEntityID()
    const invitedUserId = new UniqueEntityID().toString()
    const differentUserId = new UniqueEntityID().toString()

    const invite = makeWorkspaceInvite(
      {
        workspaceId: new UniqueEntityID().toString(),
        invitedUserId,
        invitedByUserId: new UniqueEntityID().toString(),
        roleId: new UniqueEntityID().toString(),
      },
      inviteId,
    )

    workspaceInviteRepository.items.push(invite)

    const response = await sut.execute({
      inviteId: inviteId.toString(),
      userId: differentUserId,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(NotAllowedError)
  })
})
