import type { Notification } from '../../enterprise/entities/notification.ts'

export abstract class NotificationRepository {
  abstract findById(id: string): Promise<Notification | null>
  abstract findManyByRecipientId(recipientId: string): Promise<Notification[]>
  abstract create(notification: Notification): Promise<void>
  abstract save(notification: Notification): Promise<void>
}
