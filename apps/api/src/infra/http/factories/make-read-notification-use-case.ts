import { ReadNotificationUseCase } from '@/domain/notification/application/use-cases/read-notification.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleNotificationRepository } from '@/infra/db/drizzle/repositories/notification-repository.ts'

export function makeReadNotificationUseCase() {
  const notificationRepository = new DrizzleNotificationRepository(db)
  return new ReadNotificationUseCase(notificationRepository)
}
