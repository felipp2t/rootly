import { makeNotification } from '@test/factories/make-notification.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { InMemoryNotificationRepository } from './in-memory-notification-repository.ts'

describe('InMemoryNotificationRepository', () => {
  let repo: InMemoryNotificationRepository

  beforeEach(() => {
    repo = new InMemoryNotificationRepository()
  })

  describe('create', () => {
    it('should add a notification to items', async () => {
      const notification = makeNotification()
      await repo.create(notification)
      expect(repo.items).toHaveLength(1)
      expect(repo.items[0]).toBe(notification)
    })
  })

  describe('findById', () => {
    it('should return the notification when found', async () => {
      const id = new UniqueEntityID('notif-1')
      const notification = makeNotification({}, id)
      await repo.create(notification)

      const result = await repo.findById('notif-1')

      expect(result).toBe(notification)
    })

    it('should return null when not found', async () => {
      const result = await repo.findById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('save', () => {
    it('should update an existing notification', async () => {
      const id = new UniqueEntityID('notif-save')
      const notification = makeNotification({ title: 'old title' }, id)
      await repo.create(notification)

      notification.read()
      await repo.save(notification)

      expect(repo.items[0].readAt).not.toBeNull()
    })
  })
})
