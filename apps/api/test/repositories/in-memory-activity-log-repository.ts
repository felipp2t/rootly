import {
  type Paginated,
  paginate,
  toPaginated,
} from '@/core/types/paginated.ts'
import type {
  ActivityLogRepository,
  FindManyActivityLogsOptions,
} from '@/domain/activity/application/repositories/activity-log-repository.ts'
import type { ActivityLog } from '@/domain/activity/enterprise/entities/activity-log.ts'

export class InMemoryActivityLogRepository implements ActivityLogRepository {
  items: ActivityLog[] = []

  async create(activityLog: ActivityLog): Promise<void> {
    this.items.push(activityLog)
  }

  async findManyByWorkspaceId(
    workspaceId: string,
    options?: FindManyActivityLogsOptions,
  ): Promise<Paginated<ActivityLog>> {
    const filtered = this.items
      .filter((log) => log.workspaceId === workspaceId)
      .filter(
        (log) => !options?.resourceId || log.resourceId === options.resourceId,
      )
      .filter(
        (log) =>
          !options?.resourceType || log.resourceType === options.resourceType,
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    const { page, limit, offset } = paginate(options?.page, options?.limit)

    return toPaginated(
      filtered.slice(offset, offset + limit),
      filtered.length,
      page,
      limit,
    )
  }
}
