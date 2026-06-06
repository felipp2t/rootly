import { GetNotificationsUseCase } from '@/domain/notification/application/use-cases/get-notifications.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleNotificationRepository } from '@/infra/db/drizzle/repositories/notification-repository.ts'

export function makeGetNotificationsUseCase() {
  const notificationRepository = new DrizzleNotificationRepository(db)
  return new GetNotificationsUseCase(notificationRepository)
}
