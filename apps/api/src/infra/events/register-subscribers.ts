import { OnUserInvited } from '@/domain/notification/application/subsribers/on-user-invited.ts'
import { makeSendNotificationUseCase } from '../http/factories/make-send-notification-use-case.ts'

export function registerSubscribers() {
  new OnUserInvited(makeSendNotificationUseCase())
}
