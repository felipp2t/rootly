import { makeUser } from '@test/factories/make-user.ts'
import { InMemoryActivityLogRepository } from '@test/repositories/in-memory-activity-log-repository.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { DomainEvents } from '@/core/events/domain-events.ts'
import { Item } from '@/domain/root/enterprise/entities/item.ts'
import { RecordActivityLogUseCase } from '../use-cases/record-activity-log.ts'
import { OnItemActivity } from './on-item-activity.ts'

let activityLogRepository: InMemoryActivityLogRepository
let userRepository: InMemoryUserRepository
let recordActivityLog: RecordActivityLogUseCase

// DomainEvents.dispatch() fires subscribers without awaiting them, so tests
// must flush the microtask queue before asserting on their side effects.
function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

describe('OnItemActivity', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers()
    DomainEvents.clearMarkedAggregates()

    activityLogRepository = new InMemoryActivityLogRepository()
    userRepository = new InMemoryUserRepository()
    recordActivityLog = new RecordActivityLogUseCase(
      activityLogRepository,
      userRepository,
    )

    new OnItemActivity(recordActivityLog)
  })

  it('should record an activity log when an item is created with an actor', async () => {
    const actor = await createActor()

    const item = Item.create(
      { workspaceId: 'ws-1', type: 'text', title: 'Note' },
      undefined,
      actor.id.toString(),
    )

    DomainEvents.dispatchEventsForAggregate(item.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      workspaceId: 'ws-1',
      resourceType: 'item',
      resourceId: item.id.toString(),
      resourceName: 'Note',
      action: 'item_created',
      actorUserId: actor.id.toString(),
    })
  })

  it('should not record an activity log when an item is created without an actor', async () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'text',
      title: 'Note',
    })

    DomainEvents.dispatchEventsForAggregate(item.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(0)
  })

  it('should record an activity log with a before/after diff when an item is updated', async () => {
    const actor = await createActor()

    const item = Item.create(
      { workspaceId: 'ws-1', type: 'text', title: 'Old Title' },
      new UniqueEntityID('item-1'),
    )

    item.update({ title: 'New Title' }, actor.id.toString())

    DomainEvents.dispatchEventsForAggregate(item.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      resourceType: 'item',
      action: 'item_updated',
      actorUserId: actor.id.toString(),
      metadata: {
        before: { title: 'Old Title' },
        after: { title: 'New Title' },
      },
    })
  })

  it('should record an activity log when an item is archived with an actor', async () => {
    const actor = await createActor()

    const item = Item.create(
      { workspaceId: 'ws-1', type: 'text', title: 'Note' },
      new UniqueEntityID('item-1'),
    )

    item.archive(actor.id.toString())

    DomainEvents.dispatchEventsForAggregate(item.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      resourceType: 'item',
      action: 'item_archived',
      actorUserId: actor.id.toString(),
    })
  })

  it('should record an activity log when an item is restored with an actor', async () => {
    const actor = await createActor()

    const item = Item.create(
      { workspaceId: 'ws-1', type: 'text', title: 'Note' },
      new UniqueEntityID('item-1'),
    )
    item.archive()
    item.clearEvents()

    item.restore(actor.id.toString())

    DomainEvents.dispatchEventsForAggregate(item.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      resourceType: 'item',
      action: 'item_restored',
      actorUserId: actor.id.toString(),
    })
  })

  it('should record an activity log when an item is deleted with an actor', async () => {
    const actor = await createActor()

    const item = Item.create(
      { workspaceId: 'ws-1', type: 'text', title: 'Note' },
      new UniqueEntityID('item-1'),
    )

    item.delete(actor.id.toString())

    DomainEvents.dispatchEventsForAggregate(item.id)
    await flushPromises()

    expect(activityLogRepository.items).toHaveLength(1)
    expect(activityLogRepository.items[0]).toMatchObject({
      resourceType: 'item',
      resourceId: 'item-1',
      action: 'item_deleted',
      actorUserId: actor.id.toString(),
    })
  })

  async function createActor() {
    const actor = makeUser({ name: 'John Doe' })
    await userRepository.create(actor)
    return actor
  }
})
