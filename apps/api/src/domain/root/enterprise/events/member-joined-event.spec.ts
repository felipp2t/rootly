import { makeWorkspaceMember } from '@test/factories/make-workspace-member.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { MemberJoinedEvent } from './member-joined-event.ts'

describe('MemberJoinedEvent', () => {
  it('should instantiate with a workspace member', () => {
    const member = makeWorkspaceMember({
      userId: 'user-1',
      workspaceId: 'ws-1',
      roleId: 'role-1',
    })

    const event = new MemberJoinedEvent(member)

    expect(event.workspaceMember).toBe(member)
  })

  it('should set ocurredAt to current time on instantiation', () => {
    const before = new Date()
    const member = makeWorkspaceMember({
      userId: 'user-1',
      workspaceId: 'ws-1',
      roleId: 'role-1',
    })

    const event = new MemberJoinedEvent(member)
    const after = new Date()

    expect(event.ocurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(event.ocurredAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should return the member id from getAggregateId', () => {
    const id = new UniqueEntityID('member-abc')
    const member = makeWorkspaceMember(
      { userId: 'user-1', workspaceId: 'ws-1', roleId: 'role-1' },
      id,
    )

    const event = new MemberJoinedEvent(member)

    expect(event.getAggregateId().toString()).toBe('member-abc')
  })

  it('should expose workspaceMember properties correctly', () => {
    const member = makeWorkspaceMember({
      userId: 'user-42',
      workspaceId: 'ws-99',
      roleId: 'role-7',
    })

    const event = new MemberJoinedEvent(member)

    expect(event.workspaceMember.userId).toBe('user-42')
    expect(event.workspaceMember.workspaceId).toBe('ws-99')
    expect(event.workspaceMember.roleId).toBe('role-7')
  })
})
