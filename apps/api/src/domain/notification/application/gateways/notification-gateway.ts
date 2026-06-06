import type { Notification } from '../../enterprise/entities/notification.ts'

export abstract class NotificationGateway {
  abstract send(recipientId: string, notification: Notification): void
}
