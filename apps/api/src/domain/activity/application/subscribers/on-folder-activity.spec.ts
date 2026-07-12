import { makeUser } from '@test/factories/make-user.ts'
import { InMemoryActivityLogRepository } from '@test/repositories/in-memory-activity-log-repository.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { DomainEvents } from '@/core/events/domain-events.ts'
import { Folder } from '@/domain/root/enterprise/entities/folder.ts'
import { RecordActivityLogUseCase } from '../use-cases/record-activity-log.ts'
import { OnFolderActivity } from './on-folder-activity.ts'

let activityLogRepository: InMemoryActivityLogRepository
let userRepository: InMemoryUserRepository
let recordActivityLog: RecordActivityLogUseCase

// DomainEvents.dispatch() fires subscribers without awaiting them, so tests
// must flush the microtask queue before asserting on their side effects.
function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

describe('OnFolderActivity', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers()
    DomainEvents.clearMarkedAggregates()

    activityLogRepository = new InMemoryActivityLogRepository()
    userRepository = new InMemoryUserRepository()
    recordActivityLog = new RecordActivityLogUseCase(
      activityLogRepository,
      userRepository,
    )

    new OnFolderActivity(recordActivityLog)
  })

  it('should record an activity log when a folder is created with an actor', async () => {
    const actor = await createActor()

    const folder = Folder.create(
      { name: 'Docs', workspaceId: 'ws-1' },
      undefined,
      actor.id.toString(),
    )

    DomainEvents.dispatchEventsForAggregate(folder.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      workspaceId: 'ws-1',
      resourceType: 'folder',
      resourceId: folder.id.toString(),
      resourceName: 'Docs',
      action: 'folder_created',
      actorUserId: actor.id.toString(),
    })
  })

  it('should not record an activity log when a folder is created without an actor', async () => {
    const folder = Folder.create({ name: 'Docs', workspaceId: 'ws-1' })

    DomainEvents.dispatchEventsForAggregate(folder.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(0)
  })

  it('should record an activity log with a before/after diff when a folder is renamed', async () => {
    const actor = await createActor()

    const folder = Folder.create(
      { name: 'Old Name', workspaceId: 'ws-1' },
      new UniqueEntityID('folder-1'),
    )

    folder.rename('New Name', actor.id.toString())

    DomainEvents.dispatchEventsForAggregate(folder.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      resourceType: 'folder',
      action: 'folder_renamed',
      actorUserId: actor.id.toString(),
      metadata: {
        before: { name: 'Old Name' },
        after: { name: 'New Name' },
      },
    })
  })

  it('should record an activity log when a folder is deleted with an actor', async () => {
    const actor = await createActor()

    const folder = Folder.create(
      { name: 'Docs', workspaceId: 'ws-1' },
      new UniqueEntityID('folder-1'),
    )

    folder.delete(actor.id.toString())

    DomainEvents.dispatchEventsForAggregate(folder.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      resourceType: 'folder',
      resourceId: 'folder-1',
      action: 'folder_deleted',
      actorUserId: actor.id.toString(),
    })
  })

  async function createActor() {
    const actor = makeUser({ name: 'John Doe' })
    await userRepository.create(actor)
    return actor
  }
})
