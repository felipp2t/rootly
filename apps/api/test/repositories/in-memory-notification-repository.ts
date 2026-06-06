import type { NotificationRepository } from '@/domain/notification/application/repositories/notification-repository.ts'
import type { Notification } from '@/domain/notification/enterprise/entities/notification.ts'

export class InMemoryNotificationRepository implements NotificationRepository {
  public items: Notification[] = []

  async findById(id: string) {
    const notification = this.items.find((item) => item.id.toString() === id)

    if (!notification) {
      return null
    }

    return notification
  }

  async findManyByRecipientId(recipientId: string) {
    return this.items
      .filter((item) => item.recipientId.toString() === recipientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async create(notification: Notification) {
    this.items.push(notification)
  }

  async save(notification: Notification) {
    const itemIndex = this.items.findIndex(
      (item) => item.id === notification.id,
    )

    this.items[itemIndex] = notification
  }
}
