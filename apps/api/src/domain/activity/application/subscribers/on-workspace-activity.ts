import { DomainEvents } from '@/core/events/domain-events.ts'
import type { EventHandler } from '@/core/events/event-handler.ts'
import { WorkspaceRenamedEvent } from '@/domain/root/enterprise/events/workspace-renamed-event.ts'
import type { RecordActivityLogUseCase } from '../use-cases/record-activity-log.ts'

export class OnWorkspaceActivity implements EventHandler {
  constructor(private readonly recordActivityLog: RecordActivityLogUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onWorkspaceRenamed.bind(this),
      WorkspaceRenamedEvent.name,
    )
  }

  private async onWorkspaceRenamed({
    workspace,
    changes,
    actorId,
  }: WorkspaceRenamedEvent) {
    if (!actorId) return

    await this.recordActivityLog.execute({
      workspaceId: workspace.id.toString(),
      resourceType: 'workspace',
      resourceId: workspace.id.toString(),
      resourceName: workspace.name,
      action: 'workspace_renamed',
      actorUserId: actorId,
      metadata: {
        before: { name: changes.before },
        after: { name: changes.after },
      },
    })
  }
}
