import { makeWorkspaceInvite } from '@test/factories/make-workspace-invite.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { UserInvitedEvent } from './user-invited-event.ts'

describe('UserInvitedEvent', () => {
  it('should instantiate with a workspace invite', () => {
    const invite = makeWorkspaceInvite({
      workspaceId: 'ws-1',
      invitedUserId: 'user-1',
      invitedByUserId: 'user-2',
      roleId: 'role-1',
    })

    const event = new UserInvitedEvent(invite)

    expect(event.workspaceInvite).toBe(invite)
  })

  it('should set ocurredAt to current time on instantiation', () => {
    const before = new Date()
    const invite = makeWorkspaceInvite({
      workspaceId: 'ws-1',
      invitedUserId: 'user-1',
      invitedByUserId: 'user-2',
      roleId: 'role-1',
    })

    const event = new UserInvitedEvent(invite)
    const after = new Date()

    expect(event.ocurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(event.ocurredAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should return the invite id from getAggregateId', () => {
    const id = new UniqueEntityID('invite-xyz')
    const invite = makeWorkspaceInvite(
      {
        workspaceId: 'ws-1',
        invitedUserId: 'user-1',
        invitedByUserId: 'user-2',
        roleId: 'role-1',
      },
      id,
    )

    const event = new UserInvitedEvent(invite)

    expect(event.getAggregateId().toString()).toBe('invite-xyz')
  })

  it('should expose workspaceInvite properties correctly', () => {
    const invite = makeWorkspaceInvite({
      workspaceId: 'ws-99',
      invitedUserId: 'user-10',
      invitedByUserId: 'user-20',
      roleId: 'role-5',
    })

    const event = new UserInvitedEvent(invite)

    expect(event.workspaceInvite.workspaceId).toBe('ws-99')
    expect(event.workspaceInvite.invitedUserId).toBe('user-10')
    expect(event.workspaceInvite.invitedByUserId).toBe('user-20')
    expect(event.workspaceInvite.roleId).toBe('role-5')
  })
})
