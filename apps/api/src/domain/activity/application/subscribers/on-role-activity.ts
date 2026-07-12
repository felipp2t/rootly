import { DomainEvents } from '@/core/events/domain-events.ts'
import type { EventHandler } from '@/core/events/event-handler.ts'
import { RoleCreatedEvent } from '@/domain/root/enterprise/events/role-created-event.ts'
import { RoleDeletedEvent } from '@/domain/root/enterprise/events/role-deleted-event.ts'
import { RolePermissionsChangedEvent } from '@/domain/root/enterprise/events/role-permissions-changed-event.ts'
import type { RecordActivityLogUseCase } from '../use-cases/record-activity-log.ts'

export class OnRoleActivity implements EventHandler {
  constructor(private readonly recordActivityLog: RecordActivityLogUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(this.onRoleCreated.bind(this), RoleCreatedEvent.name)
    DomainEvents.register(this.onRoleDeleted.bind(this), RoleDeletedEvent.name)
    DomainEvents.register(
      this.onRolePermissionsChanged.bind(this),
      RolePermissionsChangedEvent.name,
    )
  }

  private async onRoleCreated({ role, actorId }: RoleCreatedEvent) {
    if (!actorId) return

    await this.recordActivityLog.execute({
      workspaceId: role.workspaceId,
      resourceType: 'role',
      resourceId: role.id.toString(),
      resourceName: role.name,
      action: 'role_created',
      actorUserId: actorId,
    })
  }

  private async onRoleDeleted({ role, actorId }: RoleDeletedEvent) {
    if (!actorId) return

    await this.recordActivityLog.execute({
      workspaceId: role.workspaceId,
      resourceType: 'role',
      resourceId: role.id.toString(),
      resourceName: role.name,
      action: 'role_deleted',
      actorUserId: actorId,
    })
  }

  private async onRolePermissionsChanged({
    role,
    changes,
    actorId,
  }: RolePermissionsChangedEvent) {
    if (!actorId) return

    const format = (pairs: RolePermissionsChangedEvent['changes']['before']) =>
      pairs.map((p) => `${p.resource}:${p.action}`)

    await this.recordActivityLog.execute({
      workspaceId: role.workspaceId,
      resourceType: 'role',
      resourceId: role.id.toString(),
      resourceName: role.name,
      action: 'role_permissions_changed',
      actorUserId: actorId,
      metadata: {
        before: { permissions: format(changes.before) },
        after: { permissions: format(changes.after) },
      },
    })
  }
}
