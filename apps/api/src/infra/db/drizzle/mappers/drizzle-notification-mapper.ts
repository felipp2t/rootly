import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { Notification } from '@/domain/notification/enterprise/entities/notification.ts'
import type { schema } from '../schema/index.ts'

type DrizzleNotification = InferSelectModel<typeof schema.notifications>
type DrizzleNotificationInsert = InferInsertModel<typeof schema.notifications>

export class DrizzleNotificationMapper {
  static toDomain(raw: DrizzleNotification): Notification {
    return Notification.create(
      {
        recipientId: new UniqueEntityID(raw.recipientId),
        title: raw.title,
        content: raw.content,
        metadata: raw.metadata,
        readAt: raw.readAt,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toDrizzle(notification: Notification): DrizzleNotificationInsert {
    return {
      id: notification.id.toString(),
      recipientId: notification.recipientId.toString(),
      title: notification.title,
      content: notification.content,
      metadata: notification.metadata,
      readAt: notification.readAt ?? null,
      createdAt: notification.createdAt,
    }
  }
}
