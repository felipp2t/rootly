import type { ActivityLog } from '../../enterprise/entities/activity-log.ts'

export abstract class ActivityLogRepository {
  abstract create(activityLog: ActivityLog): Promise<void>
}
