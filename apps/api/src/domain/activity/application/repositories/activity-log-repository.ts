import type {
  ActivityLog,
  ActivityResourceType,
} from '../../enterprise/entities/activity-log.ts'

export interface FindManyActivityLogsOptions {
  resourceId?: string
  resourceType?: ActivityResourceType
}

export abstract class ActivityLogRepository {
  abstract create(activityLog: ActivityLog): Promise<void>
  abstract findManyByWorkspaceId(
    workspaceId: string,
    options?: FindManyActivityLogsOptions,
  ): Promise<ActivityLog[]>
}
