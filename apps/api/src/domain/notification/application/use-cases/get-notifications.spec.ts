import { makeNotification } from '@test/factories/make-notification.ts'
import { InMemoryNotificationRepository } from '@test/repositories/in-memory-notification-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { GetNotificationsUseCase } from './get-notifications.ts'

let inMemoryNotificationRepository: InMemoryNotificationRepository
let sut: GetNotificationsUseCase

describe('Get Notifications', () => {
  beforeEach(() => {
    inMemoryNotificationRepository = new InMemoryNotificationRepository()
    sut = new GetNotificationsUseCase(inMemoryNotificationRepository)
  })

  it('should list notifications for a recipient ordered by most recent', async () => {
    const recipientId = new UniqueEntityID('recipient-1')

    await inMemoryNotificationRepository.create(
      makeNotification({
        recipientId,
        createdAt: new Date(2026, 0, 1),
      }),
    )
    await inMemoryNotificationRepository.create(
      makeNotification({
        recipientId,
        createdAt: new Date(2026, 0, 3),
      }),
    )
    await inMemoryNotificationRepository.create(
      makeNotification({ recipientId: new UniqueEntityID('other') }),
    )

    const result = await sut.execute({ recipientId: 'recipient-1' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.notifications).toHaveLength(2)
      expect(result.value.notifications[0].createdAt).toEqual(
        new Date(2026, 0, 3),
      )
    }
  })

  it('should return an empty list when the recipient has no notifications', async () => {
    const result = await sut.execute({ recipientId: 'recipient-1' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.notifications).toHaveLength(0)
    }
  })
})
