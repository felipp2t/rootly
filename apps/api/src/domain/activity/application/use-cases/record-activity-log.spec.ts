import { makeUser } from '@test/factories/make-user.ts'
import { InMemoryActivityLogRepository } from '@test/repositories/in-memory-activity-log-repository.ts'
import { InMemoryUserRepository } from '@test/repositories/in-memory-user-repository.ts'
import { ActivityActorNotFoundError } from './errors/activity-actor-not-found-error.ts'
import { RecordActivityLogUseCase } from './record-activity-log.ts'

let inMemoryActivityLogRepository: InMemoryActivityLogRepository
let inMemoryUserRepository: InMemoryUserRepository
let sut: RecordActivityLogUseCase

describe('Record Activity Log', () => {
  beforeEach(() => {
    inMemoryActivityLogRepository = new InMemoryActivityLogRepository()
    inMemoryUserRepository = new InMemoryUserRepository()
    sut = new RecordActivityLogUseCase(
      inMemoryActivityLogRepository,
      inMemoryUserRepository,
    )
  })

  it('should record an activity log with the actor name resolved', async () => {
    const actor = makeUser({ name: 'John Doe' })
    await inMemoryUserRepository.create(actor)

    const result = await sut.execute({
      workspaceId: 'ws-1',
      resourceType: 'folder',
      resourceId: 'folder-1',
      resourceName: 'Docs',
      action: 'folder_created',
      actorUserId: actor.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryActivityLogRepository.items).toHaveLength(1)
    expect(inMemoryActivityLogRepository.items[0]).toMatchObject({
      workspaceId: 'ws-1',
      resourceType: 'folder',
      resourceId: 'folder-1',
      resourceName: 'Docs',
      action: 'folder_created',
      actorUserId: actor.id.toString(),
      actorName: 'John Doe',
    })
  })

  it('should record the metadata diff when provided', async () => {
    const actor = makeUser()
    await inMemoryUserRepository.create(actor)

    const result = await sut.execute({
      workspaceId: 'ws-1',
      resourceType: 'item',
      resourceId: 'item-1',
      resourceName: 'Contract.pdf',
      action: 'item_updated',
      actorUserId: actor.id.toString(),
      metadata: { before: { title: 'Old' }, after: { title: 'New' } },
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryActivityLogRepository.items[0].metadata).toEqual({
      before: { title: 'Old' },
      after: { title: 'New' },
    })
  })

  it('should return ActivityActorNotFoundError when the actor does not exist', async () => {
    const result = await sut.execute({
      workspaceId: 'ws-1',
      resourceType: 'folder',
      resourceId: 'folder-1',
      resourceName: 'Docs',
      action: 'folder_created',
      actorUserId: 'unknown-user',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ActivityActorNotFoundError)
    expect(inMemoryActivityLogRepository.items).toHaveLength(0)
  })
})
