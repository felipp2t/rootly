import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { makeWorkspaceInvite } from '@test/factories/make-workspace-invite.ts'
import { InMemoryWorkspaceInviteRepository } from '@test/repositories/in-memory-workspace-invite-repository.ts'
import { workspaceInviteStatus } from '../../enterprise/entities/workspace-invite.ts'
import { DeclineInviteUseCase } from './decline-invite.ts'
import { WorkspaceInviteAlreadyAcceptedError } from './errors/workspace-invite-already-accepted-error.ts'
import { WorkspaceInviteExpiredError } from './errors/workspace-invite-expired-error.ts'

let workspaceInviteRepository: InMemoryWorkspaceInviteRepository
let sut: DeclineInviteUseCase

describe('DeclineInvite', () => {
  beforeEach(() => {
    workspaceInviteRepository = new InMemoryWorkspaceInviteRepository()
    sut = new DeclineInviteUseCase(workspaceInviteRepository)
  })

  it('should be able to decline an invite', async () => {
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
    expect(response.value).toBeUndefined()
  })

  it('should update the invite status to declined in the repository', async () => {
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
      workspaceInviteStatus.DECLINED,
    )
  })

  it('should return ResourceNotFoundError when the invite does not exist', async () => {
    const response = await sut.execute({
      inviteId: new UniqueEntityID().toString(),
      userId: new UniqueEntityID().toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return WorkspaceInviteAlreadyAcceptedError when the invite is not pending', async () => {
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

  it('should return WorkspaceInviteExpiredError when the invite has expired', async () => {
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

  it('should return NotAllowedError when userId does not match invitedUserId', async () => {
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
