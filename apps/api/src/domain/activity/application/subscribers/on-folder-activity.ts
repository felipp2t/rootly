import { DomainEvents } from '@/core/events/domain-events.ts'
import type { EventHandler } from '@/core/events/event-handler.ts'
import { FolderCreatedEvent } from '@/domain/root/enterprise/events/folder-created-event.ts'
import { FolderDeletedEvent } from '@/domain/root/enterprise/events/folder-deleted-event.ts'
import { FolderRenamedEvent } from '@/domain/root/enterprise/events/folder-renamed-event.ts'
import type { RecordActivityLogUseCase } from '../use-cases/record-activity-log.ts'

export class OnFolderActivity implements EventHandler {
  constructor(private readonly recordActivityLog: RecordActivityLogUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onFolderCreated.bind(this),
      FolderCreatedEvent.name,
    )
    DomainEvents.register(
      this.onFolderRenamed.bind(this),
      FolderRenamedEvent.name,
    )
    DomainEvents.register(
      this.onFolderDeleted.bind(this),
      FolderDeletedEvent.name,
    )
  }

  private async onFolderCreated({ folder, actorId }: FolderCreatedEvent) {
    if (!actorId) return

    await this.recordActivityLog.execute({
      workspaceId: folder.workspaceId,
      resourceType: 'folder',
      resourceId: folder.id.toString(),
      resourceName: folder.name,
      action: 'folder_created',
      actorUserId: actorId,
    })
  }

  private async onFolderRenamed({
    folder,
    changes,
    actorId,
  }: FolderRenamedEvent) {
    if (!actorId) return

    await this.recordActivityLog.execute({
      workspaceId: folder.workspaceId,
      resourceType: 'folder',
      resourceId: folder.id.toString(),
      resourceName: folder.name,
      action: 'folder_renamed',
      actorUserId: actorId,
      metadata: {
        before: { name: changes.before },
        after: { name: changes.after },
      },
    })
  }

  private async onFolderDeleted({ folder, actorId }: FolderDeletedEvent) {
    if (!actorId) return

    await this.recordActivityLog.execute({
      workspaceId: folder.workspaceId,
      resourceType: 'folder',
      resourceId: folder.id.toString(),
      resourceName: folder.name,
      action: 'folder_deleted',
      actorUserId: actorId,
    })
  }
}
