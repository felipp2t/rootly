import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import {
  INVITE_EXPIRATION_MS,
  WorkspaceInvite,
  workspaceInviteStatus,
} from './workspace-invite.ts'

const baseProps = {
  workspaceId: 'ws-1',
  invitedUserId: 'user-invited',
  invitedByUserId: 'user-host',
  roleId: 'role-1',
}

describe('WorkspaceInvite', () => {
  it('should create an invite with default status and expiration', () => {
    const before = new Date()
    const invite = WorkspaceInvite.create(baseProps)
    const after = new Date()

    expect(invite.workspaceId).toBe('ws-1')
    expect(invite.invitedUserId).toBe('user-invited')
    expect(invite.invitedByUserId).toBe('user-host')
    expect(invite.roleId).toBe('role-1')
    expect(invite.status).toBe(workspaceInviteStatus.PENDING)
    expect(invite.expiresAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime() + INVITE_EXPIRATION_MS - 1000,
    )
    expect(invite.expiresAt.getTime()).toBeLessThanOrEqual(
      after.getTime() + INVITE_EXPIRATION_MS + 1000,
    )
    expect(invite.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(invite.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should create an invite with explicit timestamps and status', () => {
    const createdAt = new Date('2024-01-01')
    const updatedAt = new Date('2024-01-02')
    const expiresAt = new Date('2024-01-08')

    const invite = WorkspaceInvite.create({
      ...baseProps,
      status: workspaceInviteStatus.DECLINED,
      createdAt,
      updatedAt,
      expiresAt,
    })

    expect(invite.status).toBe('declined')
    expect(invite.createdAt).toEqual(createdAt)
    expect(invite.updatedAt).toEqual(updatedAt)
    expect(invite.expiresAt).toEqual(expiresAt)
  })

  it('should create an invite with a provided id', () => {
    const id = new UniqueEntityID('invite-fixed-id')
    const invite = WorkspaceInvite.create(baseProps, id)

    expect(invite.id.toString()).toBe('invite-fixed-id')
  })

  it('should dispatch UserInvitedEvent when created without an id', () => {
    const invite = WorkspaceInvite.create(baseProps)

    expect(invite.domainEvents).toHaveLength(1)
    expect(invite.domainEvents[0].constructor.name).toBe('UserInvitedEvent')
  })

  it('should not dispatch UserInvitedEvent when reconstituted with an id', () => {
    const id = new UniqueEntityID('existing-invite-id')
    const invite = WorkspaceInvite.create(baseProps, id)

    expect(invite.domainEvents).toHaveLength(0)
  })

  it('should accept an invite and update status and updatedAt', () => {
    const invite = WorkspaceInvite.create(baseProps)
    const beforeUpdate = invite.updatedAt

    invite.accept()

    expect(invite.status).toBe(workspaceInviteStatus.ACCEPTED)
    expect(invite.updatedAt.getTime()).toBeGreaterThanOrEqual(
      beforeUpdate.getTime(),
    )
  })

  it('should decline an invite and update status and updatedAt', () => {
    const invite = WorkspaceInvite.create(baseProps)
    const beforeUpdate = invite.updatedAt

    invite.decline()

    expect(invite.status).toBe(workspaceInviteStatus.DECLINED)
    expect(invite.updatedAt.getTime()).toBeGreaterThanOrEqual(
      beforeUpdate.getTime(),
    )
  })

  it('should update status via setter and touch updatedAt', () => {
    const invite = WorkspaceInvite.create(baseProps)
    const beforeUpdate = invite.updatedAt

    invite.status = workspaceInviteStatus.REVOKED

    expect(invite.status).toBe('revoked')
    expect(invite.updatedAt.getTime()).toBeGreaterThanOrEqual(
      beforeUpdate.getTime(),
    )
  })

  it('should expose all workspaceInviteStatus values', () => {
    expect(workspaceInviteStatus.PENDING).toBe('pending')
    expect(workspaceInviteStatus.ACCEPTED).toBe('accepted')
    expect(workspaceInviteStatus.DECLINED).toBe('declined')
    expect(workspaceInviteStatus.REVOKED).toBe('revoked')
  })
})
