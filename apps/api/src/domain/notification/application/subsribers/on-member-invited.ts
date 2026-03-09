import { DomainEvents } from '@/core/events/domain-events.ts'
import type { EventHandler } from '@/core/events/event-handler.ts'
import { MemberInvitedEvent } from '@/domain/root/enterprise/events/member-invited-event.ts'
import type { SendNotificationUseCase } from '../use-cases/send-notification.ts'

export class OnMemberInvited implements EventHandler {
  constructor(private readonly sendNotification: SendNotificationUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendInviteNotification.bind(this),
      MemberInvitedEvent.name,
    )
  }

  private async sendInviteNotification({
    workspaceMember,
  }: MemberInvitedEvent) {
    await this.sendNotification.execute({
      recipientId: workspaceMember.userId,
      title: 'Você foi convidado para um workspace',
      content: `Você foi adicionado ao workspace ${workspaceMember.workspaceId}.`,
    })
  }
}
