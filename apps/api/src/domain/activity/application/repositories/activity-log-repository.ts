import type { Paginated } from '@/core/types/paginated.ts'
import type {
  ActivityLog,
  ActivityResourceType,
} from '../../enterprise/entities/activity-log.ts'

export interface FindManyActivityLogsOptions {
  resourceId?: string
  resourceType?: ActivityResourceType
  page?: number
  limit?: number
}

export abstract class ActivityLogRepository {
  abstract create(activityLog: ActivityLog): Promise<void>
  abstract findManyByWorkspaceId(
    workspaceId: string,
    options?: FindManyActivityLogsOptions,
  ): Promise<Paginated<ActivityLog>>
}
