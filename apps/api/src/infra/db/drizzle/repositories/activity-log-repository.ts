import type { ActivityLogRepository } from '@/domain/activity/application/repositories/activity-log-repository.ts'
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
}
