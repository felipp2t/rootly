import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { type Either, right } from '@/core/types/either.ts'
import {
  Notification,
  type NotificationMetadata,
} from '../../enterprise/entities/notification.ts'
import type { NotificationRepository } from '../repositories/notification-repository.ts'

export interface SendNotificationUseCaseRequest {
  recipientId: string
  title: string
  content: string
  metadata: NotificationMetadata
}

export type SendNotificationUseCaseResponse = Either<
  null,
  {
    notification: Notification
  }
>

export class SendNotificationUseCase {
  constructor(private notificationsRepository: NotificationRepository) {}

  async execute({
    recipientId,
    title,
    content,
    metadata,
  }: SendNotificationUseCaseRequest): Promise<SendNotificationUseCaseResponse> {
    const notification = Notification.create({
      recipientId: new UniqueEntityID(recipientId),
      title,
      content,
      metadata,
    })

    await this.notificationsRepository.create(notification)

    return right({
      notification,
    })
  }
}
