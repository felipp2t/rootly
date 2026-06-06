import type { NotificationGateway } from '@/domain/notification/application/gateways/notification-gateway.ts'
import type { Notification } from '@/domain/notification/enterprise/entities/notification.ts'

export class FakeNotificationGateway implements NotificationGateway {
  public sent: { recipientId: string; notification: Notification }[] = []

  send(recipientId: string, notification: Notification): void {
    this.sent.push({ recipientId, notification })
  }
}
