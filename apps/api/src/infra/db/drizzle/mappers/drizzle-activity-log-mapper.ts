import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { ActivityLog } from '@/domain/activity/enterprise/entities/activity-log.ts'
import type { schema } from '../schema/index.ts'

type DrizzleActivityLog = InferSelectModel<typeof schema.activityLogs>
type DrizzleActivityLogInsert = InferInsertModel<typeof schema.activityLogs>

export class DrizzleActivityLogMapper {
  static toDomain(raw: DrizzleActivityLog): ActivityLog {
    return ActivityLog.create(
      {
        workspaceId: raw.workspaceId,
        resourceType: raw.resourceType,
        resourceId: raw.resourceId,
        resourceName: raw.resourceName,
        action: raw.action,
        actorUserId: raw.actorUserId,
        actorName: raw.actorName,
        metadata: raw.metadata ?? undefined,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toDrizzle(activityLog: ActivityLog): DrizzleActivityLogInsert {
    return {
      id: activityLog.id.toString(),
      workspaceId: activityLog.workspaceId,
      resourceType: activityLog.resourceType,
      resourceId: activityLog.resourceId,
      resourceName: activityLog.resourceName,
      action: activityLog.action,
      actorUserId: activityLog.actorUserId,
      actorName: activityLog.actorName,
      metadata: activityLog.metadata ?? null,
      createdAt: activityLog.createdAt,
    }
  }
}
