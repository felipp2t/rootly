import { makeUser } from '@test/factories/make-user.ts'
import { InMemoryActivityLogRepository } from '@test/repositories/in-memory-activity-log-repository.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { InMemoryWorkspaceRoleRepository } from '@test/repositories/in-memory-workspace-role-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { DomainEvents } from '@/core/events/domain-events.ts'
import { WorkspaceInvite } from '@/domain/root/enterprise/entities/workspace-invite.ts'
import { WorkspaceMember } from '@/domain/root/enterprise/entities/workspace-member.ts'
import { WorkspaceRole } from '@/domain/root/enterprise/entities/workspace-role.ts'
import { RecordActivityLogUseCase } from '../use-cases/record-activity-log.ts'
import { OnMemberActivity } from './on-member-activity.ts'

function makeInvite(target: { id: { toString(): string } }) {
  return WorkspaceInvite.create(
    {
      workspaceId: 'ws-1',
      invitedUserId: target.id.toString(),
      invitedByUserId: 'inviter-1',
      roleId: 'role-1',
    },
    new UniqueEntityID('invite-1'),
  )
}

let activityLogRepository: InMemoryActivityLogRepository
let userRepository: InMemoryUserRepository
let workspaceRoleRepository: InMemoryWorkspaceRoleRepository
let recordActivityLog: RecordActivityLogUseCase

// DomainEvents.dispatch() fires subscribers without awaiting them, so tests
// must flush the microtask queue before asserting on their side effects.
function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

describe('OnMemberActivity', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers()
    DomainEvents.clearMarkedAggregates()

    activityLogRepository = new InMemoryActivityLogRepository()
    userRepository = new InMemoryUserRepository()
    workspaceRoleRepository = new InMemoryWorkspaceRoleRepository()
    recordActivityLog = new RecordActivityLogUseCase(
      activityLogRepository,
      userRepository,
    )

    new OnMemberActivity(
      recordActivityLog,
      userRepository,
      workspaceRoleRepository,
    )
  })

  it('should record an activity log when a user is invited', async () => {
    const inviter = await createUser({ name: 'Inviter' })
    const invited = await createUser({ name: 'Invited Person' })

    const invite = WorkspaceInvite.create({
      workspaceId: 'ws-1',
      invitedUserId: invited.id.toString(),
      invitedByUserId: inviter.id.toString(),
      roleId: 'role-1',
    })

    DomainEvents.dispatchEventsForAggregate(invite.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      workspaceId: 'ws-1',
      resourceType: 'member',
      resourceId: invited.id.toString(),
      resourceName: 'Invited Person',
      action: 'member_invited',
      actorUserId: inviter.id.toString(),
    })
  })

  it('should record an activity log when a member joins', async () => {
    const user = await createUser({ name: 'New Member' })

    const member = WorkspaceMember.create({
      userId: user.id.toString(),
      workspaceId: 'ws-1',
      roleId: 'role-1',
    })

    DomainEvents.dispatchEventsForAggregate(member.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      workspaceId: 'ws-1',
      resourceType: 'member',
      resourceId: user.id.toString(),
      resourceName: 'New Member',
      action: 'member_joined',
      actorUserId: user.id.toString(),
    })
  })

  it('should record an activity log with resolved role names when a member role changes', async () => {
    const actor = await createUser({ name: 'Admin' })
    const target = await createUser({ name: 'Target Member' })

    const viewerRole = WorkspaceRole.create({
      name: 'Viewer',
      workspaceId: 'ws-1',
    })
    const developerRole = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: 'ws-1',
    })
    workspaceRoleRepository.items.push(viewerRole, developerRole)

    const member = WorkspaceMember.create(
      {
        userId: target.id.toString(),
        workspaceId: 'ws-1',
        roleId: viewerRole.id.toString(),
      },
      new UniqueEntityID('member-1'),
    )

    member.changeRole(developerRole.id.toString(), actor.id.toString())

    DomainEvents.dispatchEventsForAggregate(member.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      resourceType: 'member',
      resourceId: target.id.toString(),
      action: 'member_role_changed',
      actorUserId: actor.id.toString(),
      metadata: {
        before: { role: 'Viewer' },
        after: { role: 'Developer' },
      },
    })
  })

  it('should not record an activity log when a member role changes without an actor', async () => {
    const target = await createUser({ name: 'Target Member' })

    const member = WorkspaceMember.create(
      { userId: target.id.toString(), workspaceId: 'ws-1', roleId: 'role-old' },
      new UniqueEntityID('member-1'),
    )

    member.changeRole('role-new')

    DomainEvents.dispatchEventsForAggregate(member.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(0)
  })

  it('should record an activity log when a member is removed', async () => {
    const actor = await createUser({ name: 'Admin' })
    const target = await createUser({ name: 'Target Member' })

    const member = WorkspaceMember.create(
      { userId: target.id.toString(), workspaceId: 'ws-1', roleId: 'role-1' },
      new UniqueEntityID('member-1'),
    )

    member.remove(actor.id.toString())

    DomainEvents.dispatchEventsForAggregate(member.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      resourceType: 'member',
      resourceId: target.id.toString(),
      action: 'member_removed',
      actorUserId: actor.id.toString(),
    })
  })

  it('should not record an activity log when a member is removed without an actor', async () => {
    const target = await createUser({ name: 'Target Member' })

    const member = WorkspaceMember.create(
      { userId: target.id.toString(), workspaceId: 'ws-1', roleId: 'role-1' },
      new UniqueEntityID('member-1'),
    )

    member.remove()

    DomainEvents.dispatchEventsForAggregate(member.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(0)
  })

  it('should record an activity log when an invite is revoked', async () => {
    const actor = await createUser({ name: 'Admin' })
    const target = await createUser({ name: 'Target Member' })

    const invite = makeInvite(target)
    invite.revoke(actor.id.toString())

    DomainEvents.dispatchEventsForAggregate(invite.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      workspaceId: 'ws-1',
      resourceType: 'member',
      resourceId: target.id.toString(),
      resourceName: 'Target Member',
      action: 'member_invite_revoked',
      actorUserId: actor.id.toString(),
    })
  })

  it('should not record an activity log when an invite is revoked without an actor', async () => {
    const target = await createUser({ name: 'Target Member' })

    const invite = makeInvite(target)
    invite.revoke()

    DomainEvents.dispatchEventsForAggregate(invite.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(0)
  })

  it('should record an activity log when an invite is declined', async () => {
    const target = await createUser({ name: 'Target Member' })

    const invite = makeInvite(target)
    invite.decline(target.id.toString())

    DomainEvents.dispatchEventsForAggregate(invite.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      workspaceId: 'ws-1',
      resourceType: 'member',
      resourceId: target.id.toString(),
      resourceName: 'Target Member',
      action: 'member_invite_declined',
      actorUserId: target.id.toString(),
    })
  })

  it('should not record an activity log when an invite is declined without an actor', async () => {
    const target = await createUser({ name: 'Target Member' })

    const invite = makeInvite(target)
    invite.decline()

    DomainEvents.dispatchEventsForAggregate(invite.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(0)
  })

  async function createUser(override: { name: string }) {
    const user = makeUser({ name: override.name })
    await userRepository.create(user)
    return user
  }
})
