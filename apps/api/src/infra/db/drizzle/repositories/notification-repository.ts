import { eq } from 'drizzle-orm'
import type { NotificationRepository } from '@/domain/notification/application/repositories/notification-repository.ts'
import type { Notification } from '@/domain/notification/enterprise/entities/notification.ts'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleNotificationMapper } from '../mappers/drizzle-notification-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleNotificationRepository implements NotificationRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: string): Promise<Notification | null> {
    const notifications = await this.db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.id, id))

    if (notifications.length === 0) {
      return null
    }

    return DrizzleNotificationMapper.toDomain(notifications[0])
  }

  async create(notification: Notification): Promise<void> {
    await this.db
      .insert(schema.notifications)
      .values(DrizzleNotificationMapper.toDrizzle(notification))
  }

  async save(notification: Notification): Promise<void> {
    await this.db
      .update(schema.notifications)
      .set(DrizzleNotificationMapper.toDrizzle(notification))
      .where(eq(schema.notifications.id, notification.id.toString()))
  }
}
