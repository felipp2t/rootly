import type { ActivityLogRepository } from '@/domain/activity/application/repositories/activity-log-repository.ts'
import type { ActivityLog } from '@/domain/activity/enterprise/entities/activity-log.ts'

export class InMemoryActivityLogRepository implements ActivityLogRepository {
  items: ActivityLog[] = []

  async create(activityLog: ActivityLog): Promise<void> {
    this.items.push(activityLog)
  }
}
