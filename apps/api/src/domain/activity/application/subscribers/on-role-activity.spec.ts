import { makeUser } from '@test/factories/make-user.ts'
import { InMemoryActivityLogRepository } from '@test/repositories/in-memory-activity-log-repository.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { DomainEvents } from '@/core/events/domain-events.ts'
import { WorkspaceRole } from '@/domain/root/enterprise/entities/workspace-role.ts'
import { RecordActivityLogUseCase } from '../use-cases/record-activity-log.ts'
import { OnRoleActivity } from './on-role-activity.ts'

let activityLogRepository: InMemoryActivityLogRepository
let userRepository: InMemoryUserRepository
let recordActivityLog: RecordActivityLogUseCase

// DomainEvents.dispatch() fires subscribers without awaiting them, so tests
// must flush the microtask queue before asserting on their side effects.
function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

describe('OnRoleActivity', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers()
    DomainEvents.clearMarkedAggregates()

    activityLogRepository = new InMemoryActivityLogRepository()
    userRepository = new InMemoryUserRepository()
    recordActivityLog = new RecordActivityLogUseCase(
      activityLogRepository,
      userRepository,
    )

    new OnRoleActivity(recordActivityLog)
  })

  it('should not record an activity log when rehydrating a role with an existing id', async () => {
    const actor = await createActor()

    const role = WorkspaceRole.create(
      { name: 'Developer', workspaceId: 'ws-1' },
      new UniqueEntityID('role-1'),
      actor.id.toString(),
    )

    DomainEvents.dispatchEventsForAggregate(role.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(0)
  })

  it('should record an activity log when a role is created', async () => {
    const actor = await createActor()

    const role = WorkspaceRole.create(
      { name: 'Developer', workspaceId: 'ws-1' },
      undefined,
      actor.id.toString(),
    )

    DomainEvents.dispatchEventsForAggregate(role.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      workspaceId: 'ws-1',
      resourceType: 'role',
      resourceId: role.id.toString(),
      resourceName: 'Developer',
      action: 'role_created',
      actorUserId: actor.id.toString(),
    })
  })

  it('should not record an activity log when a role is created without an actor', async () => {
    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: 'ws-1',
    })

    DomainEvents.dispatchEventsForAggregate(role.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(0)
  })

  it('should record an activity log when a role is deleted', async () => {
    const actor = await createActor()

    const role = WorkspaceRole.create(
      { name: 'Developer', workspaceId: 'ws-1' },
      new UniqueEntityID('role-1'),
    )
    role.delete(actor.id.toString())

    DomainEvents.dispatchEventsForAggregate(role.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      workspaceId: 'ws-1',
      resourceType: 'role',
      resourceId: 'role-1',
      resourceName: 'Developer',
      action: 'role_deleted',
      actorUserId: actor.id.toString(),
    })
  })

  it('should not record an activity log when a role is deleted without an actor', async () => {
    const role = WorkspaceRole.create(
      { name: 'Developer', workspaceId: 'ws-1' },
      new UniqueEntityID('role-1'),
    )
    role.delete()

    DomainEvents.dispatchEventsForAggregate(role.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(0)
  })

  it('should record an activity log with a before/after permission diff when permissions change', async () => {
    const actor = await createActor()

    const role = WorkspaceRole.create(
      { name: 'Developer', workspaceId: 'ws-1' },
      new UniqueEntityID('role-1'),
    )
    role.changePermissions(
      [{ resource: 'folder', action: 'read' }],
      [
        { resource: 'folder', action: 'read' },
        { resource: 'item', action: 'create' },
      ],
      actor.id.toString(),
    )

    DomainEvents.dispatchEventsForAggregate(role.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      workspaceId: 'ws-1',
      resourceType: 'role',
      resourceId: 'role-1',
      resourceName: 'Developer',
      action: 'role_permissions_changed',
      actorUserId: actor.id.toString(),
      metadata: {
        before: { permissions: ['folder:read'] },
        after: { permissions: ['folder:read', 'item:create'] },
      },
    })
  })

  it('should not record an activity log when permissions change without an actor', async () => {
    const role = WorkspaceRole.create(
      { name: 'Developer', workspaceId: 'ws-1' },
      new UniqueEntityID('role-1'),
    )
    role.changePermissions([], [{ resource: 'folder', action: 'read' }])

    DomainEvents.dispatchEventsForAggregate(role.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(0)
  })

  async function createActor() {
    const actor = makeUser({ name: 'Admin' })
    await userRepository.create(actor)
    return actor
  }
})
