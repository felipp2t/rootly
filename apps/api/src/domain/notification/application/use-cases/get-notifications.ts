import { type Either, right } from '@/core/types/either.ts'
import type { Notification } from '../../enterprise/entities/notification.ts'
import type { NotificationRepository } from '../repositories/notification-repository.ts'

interface GetNotificationsUseCaseRequest {
  recipientId: string
}

type GetNotificationsUseCaseResponse = Either<
  null,
  {
    notifications: Notification[]
  }
>

export class GetNotificationsUseCase {
  constructor(private notificationsRepository: NotificationRepository) {}

  async execute({
    recipientId,
  }: GetNotificationsUseCaseRequest): Promise<GetNotificationsUseCaseResponse> {
    const notifications =
      await this.notificationsRepository.findManyByRecipientId(recipientId)

    return right({ notifications })
  }
}
