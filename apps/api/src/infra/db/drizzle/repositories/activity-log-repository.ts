import { and, count, desc, eq } from 'drizzle-orm'
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
  ): Promise<Paginated<ActivityLog>> {
    const conditions = [eq(schema.activityLogs.workspaceId, workspaceId)]

    if (options?.resourceId) {
      conditions.push(eq(schema.activityLogs.resourceId, options.resourceId))
    }

    if (options?.resourceType) {
      conditions.push(
        eq(schema.activityLogs.resourceType, options.resourceType),
      )
    }

    const whereCondition = and(...conditions)
    const { page, limit, offset } = paginate(options?.page, options?.limit)

    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(schema.activityLogs)
        .where(whereCondition)
        .orderBy(desc(schema.activityLogs.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ total: count() })
        .from(schema.activityLogs)
        .where(whereCondition),
    ])

    return toPaginated(
      rows.map(DrizzleActivityLogMapper.toDomain),
      total,
      page,
      limit,
    )
  }
}
