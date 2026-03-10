import { DomainEvents } from '@/core/events/domain-events.ts'
import type { EventHandler } from '@/core/events/event-handler.ts'
import { UserInvitedEvent } from '@/domain/root/enterprise/events/user-invited-event.ts'
import type { SendNotificationUseCase } from '../use-cases/send-notification.ts'

export class OnUserInvited implements EventHandler {
  constructor(private readonly sendNotification: SendNotificationUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendInviteNotification.bind(this),
      UserInvitedEvent.name,
    )
  }

  private async sendInviteNotification({ workspaceInvite }: UserInvitedEvent) {
    await this.sendNotification.execute({
      recipientId: workspaceInvite.invitedUserId,
      title: 'Você foi convidado para um workspace',
      content: `Você recebeu um convite para entrar no workspace ${workspaceInvite.workspaceId}.`,
      metadata: {
        type: 'workspace_invite',
        inviteId: workspaceInvite.id.toString(),
      },
    })
  }
}
