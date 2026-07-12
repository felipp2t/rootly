import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { InMemoryActivityLogRepository } from '@test/repositories/in-memory-activity-log-repository.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { DomainEvents } from '@/core/events/domain-events.ts'
import { RecordActivityLogUseCase } from '../use-cases/record-activity-log.ts'
import { OnWorkspaceActivity } from './on-workspace-activity.ts'

let activityLogRepository: InMemoryActivityLogRepository
let userRepository: InMemoryUserRepository
let recordActivityLog: RecordActivityLogUseCase

// DomainEvents.dispatch() fires subscribers without awaiting them, so tests
// must flush the microtask queue before asserting on their side effects.
function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

describe('OnWorkspaceActivity', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers()
    DomainEvents.clearMarkedAggregates()

    activityLogRepository = new InMemoryActivityLogRepository()
    userRepository = new InMemoryUserRepository()
    recordActivityLog = new RecordActivityLogUseCase(
      activityLogRepository,
      userRepository,
    )

    new OnWorkspaceActivity(recordActivityLog)
  })

  it('should record an activity log with a before/after diff when a workspace is renamed', async () => {
    const actor = await createActor()

    const workspace = makeWorkspace(
      { name: 'Old Name', userId: 'owner-1' },
      new UniqueEntityID('ws-1'),
    )

    workspace.rename('New Name', actor.id.toString())

    DomainEvents.dispatchEventsForAggregate(workspace.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      workspaceId: 'ws-1',
      resourceType: 'workspace',
      resourceId: 'ws-1',
      resourceName: 'New Name',
      action: 'workspace_renamed',
      actorUserId: actor.id.toString(),
      metadata: {
        before: { name: 'Old Name' },
        after: { name: 'New Name' },
      },
    })
  })

  it('should not record an activity log when a workspace is renamed without an actor', async () => {
    const workspace = makeWorkspace(
      { name: 'Old Name', userId: 'owner-1' },
      new UniqueEntityID('ws-1'),
    )

    workspace.rename('New Name')

    DomainEvents.dispatchEventsForAggregate(workspace.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(0)
  })

  async function createActor() {
    const actor = makeUser({ name: 'John Doe' })
    await userRepository.create(actor)
    return actor
  }
})
