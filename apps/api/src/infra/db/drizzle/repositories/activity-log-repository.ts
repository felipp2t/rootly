import { and, desc, eq } from 'drizzle-orm'
import type {
  ActivityLogRepository,
  FindManyActivityLogsOptions,
} from '@/domain/activity/application/repositories/activity-log-repository.ts'
import type { ActivityLog } from '@/domain/activity/enterprise/entities/activity-log.ts'
import type { DrizzleDatabase } from '../index.ts'
import { DrizzleActivityLogMapper } from '../mappers/drizzle-activity-log-mapper.ts'
import { schema } from '../schema/index.ts'

export class DrizzleActivityLogRepository implements ActivityLogRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async create(activityLog: ActivityLog): Promise<void> {
    await this.db
      .insert(schema.activityLogs)
      .values(DrizzleActivityLogMapper.toDrizzle(activityLog))
  }

  async findManyByWorkspaceId(
    workspaceId: string,
    options?: FindManyActivityLogsOptions,
  ): Promise<ActivityLog[]> {
    const conditions = [eq(schema.activityLogs.workspaceId, workspaceId)]

    if (options?.resourceId) {
      conditions.push(eq(schema.activityLogs.resourceId, options.resourceId))
    }

    if (options?.resourceType) {
      conditions.push(
        eq(schema.activityLogs.resourceType, options.resourceType),
      )
    }

    const rows = await this.db
      .select()
      .from(schema.activityLogs)
      .where(and(...conditions))
      .orderBy(desc(schema.activityLogs.createdAt))

    return rows.map(DrizzleActivityLogMapper.toDomain)
  }
}
