import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleNotificationRepository } from '@/infra/db/drizzle/repositories/notification-repository.ts'
import { webSocketNotificationGateway } from '@/infra/realtime/websocket-notification-gateway.ts'

export function makeSendNotificationUseCase() {
  const notificationRepository = new DrizzleNotificationRepository(db)
  return new SendNotificationUseCase(
    notificationRepository,
    webSocketNotificationGateway,
  )
}
