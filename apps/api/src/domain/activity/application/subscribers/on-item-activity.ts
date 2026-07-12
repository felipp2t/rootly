import { DomainEvents } from '@/core/events/domain-events.ts'
import type { EventHandler } from '@/core/events/event-handler.ts'
import { ItemArchivedEvent } from '@/domain/root/enterprise/events/item-archived-event.ts'
import { ItemCreatedEvent } from '@/domain/root/enterprise/events/item-created-event.ts'
import { ItemDeletedEvent } from '@/domain/root/enterprise/events/item-deleted-event.ts'
import { ItemRestoredEvent } from '@/domain/root/enterprise/events/item-restored-event.ts'
import { ItemUpdatedEvent } from '@/domain/root/enterprise/events/item-updated-event.ts'
import type { RecordActivityLogUseCase } from '../use-cases/record-activity-log.ts'

export class OnItemActivity implements EventHandler {
  constructor(private readonly recordActivityLog: RecordActivityLogUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(this.onItemCreated.bind(this), ItemCreatedEvent.name)
    DomainEvents.register(this.onItemUpdated.bind(this), ItemUpdatedEvent.name)
    DomainEvents.register(
      this.onItemArchived.bind(this),
      ItemArchivedEvent.name,
    )
    DomainEvents.register(
      this.onItemRestored.bind(this),
      ItemRestoredEvent.name,
    )
    DomainEvents.register(this.onItemDeleted.bind(this), ItemDeletedEvent.name)
  }

  private async onItemCreated({ item, actorId }: ItemCreatedEvent) {
    if (!actorId) return

    await this.recordActivityLog.execute({
      workspaceId: item.workspaceId,
      resourceType: 'item',
      resourceId: item.id.toString(),
      resourceName: item.title,
      action: 'item_created',
      actorUserId: actorId,
    })
  }

  private async onItemUpdated({ item, changes, actorId }: ItemUpdatedEvent) {
    if (!actorId) return

    await this.recordActivityLog.execute({
      workspaceId: item.workspaceId,
      resourceType: 'item',
      resourceId: item.id.toString(),
      resourceName: item.title,
      action: 'item_updated',
      actorUserId: actorId,
      metadata: {
        before: { ...changes.before },
        after: { ...changes.after },
      },
    })
  }

  private async onItemArchived({ item, actorId }: ItemArchivedEvent) {
    if (!actorId) return

    await this.recordActivityLog.execute({
      workspaceId: item.workspaceId,
      resourceType: 'item',
      resourceId: item.id.toString(),
      resourceName: item.title,
      action: 'item_archived',
      actorUserId: actorId,
    })
  }

  private async onItemRestored({ item, actorId }: ItemRestoredEvent) {
    if (!actorId) return

    await this.recordActivityLog.execute({
      workspaceId: item.workspaceId,
      resourceType: 'item',
      resourceId: item.id.toString(),
      resourceName: item.title,
      action: 'item_restored',
      actorUserId: actorId,
    })
  }

  private async onItemDeleted({ item, actorId }: ItemDeletedEvent) {
    if (!actorId) return

    await this.recordActivityLog.execute({
      workspaceId: item.workspaceId,
      resourceType: 'item',
      resourceId: item.id.toString(),
      resourceName: item.title,
      action: 'item_deleted',
      actorUserId: actorId,
    })
  }
}
