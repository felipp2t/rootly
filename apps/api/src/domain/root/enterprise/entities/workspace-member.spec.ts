import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { WorkspaceMember } from './workspace-member.ts'

describe('WorkspaceMember', () => {
  it('should create a workspace member with default timestamps', () => {
    const before = new Date()
    const member = WorkspaceMember.create({
      userId: 'user-1',
      workspaceId: 'ws-1',
      roleId: 'role-1',
    })
    const after = new Date()

    expect(member.userId).toBe('user-1')
    expect(member.workspaceId).toBe('ws-1')
    expect(member.roleId).toBe('role-1')
    expect(member.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(member.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    expect(member.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(member.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should create a workspace member with explicit timestamps', () => {
    const createdAt = new Date('2024-01-01')
    const updatedAt = new Date('2024-01-02')

    const member = WorkspaceMember.create({
      userId: 'user-1',
      workspaceId: 'ws-1',
      roleId: 'role-1',
      createdAt,
      updatedAt,
    })

    expect(member.createdAt).toEqual(createdAt)
    expect(member.updatedAt).toEqual(updatedAt)
  })

  it('should create a workspace member with a provided id', () => {
    const id = new UniqueEntityID('member-fixed-id')
    const member = WorkspaceMember.create(
      { userId: 'user-1', workspaceId: 'ws-1', roleId: 'role-1' },
      id,
    )

    expect(member.id.toString()).toBe('member-fixed-id')
  })

  it('should dispatch MemberJoinedEvent when created without an id', () => {
    const member = WorkspaceMember.create({
      userId: 'user-1',
      workspaceId: 'ws-1',
      roleId: 'role-1',
    })

    expect(member.domainEvents).toHaveLength(1)
    expect(member.domainEvents[0].constructor.name).toBe('MemberJoinedEvent')
  })

  it('should not dispatch MemberJoinedEvent when reconstituted with an id', () => {
    const id = new UniqueEntityID('existing-member-id')
    const member = WorkspaceMember.create(
      { userId: 'user-1', workspaceId: 'ws-1', roleId: 'role-1' },
      id,
    )

    expect(member.domainEvents).toHaveLength(0)
  })

  it('should update roleId and touch updatedAt', () => {
    const member = WorkspaceMember.create({
      userId: 'user-1',
      workspaceId: 'ws-1',
      roleId: 'role-old',
    })
    const beforeUpdate = member.updatedAt

    member.roleId = 'role-new'

    expect(member.roleId).toBe('role-new')
    expect(member.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime())
  })
})
