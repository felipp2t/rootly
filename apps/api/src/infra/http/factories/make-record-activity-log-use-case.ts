import { RecordActivityLogUseCase } from '@/domain/activity/application/use-cases/record-activity-log.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleActivityLogRepository } from '@/infra/db/drizzle/repositories/activity-log-repository.ts'
import { DrizzleUserRepository } from '@/infra/db/drizzle/repositories/user-respository.ts'

export function makeRecordActivityLogUseCase() {
  const activityLogRepository = new DrizzleActivityLogRepository(db)
  const userRepository = new DrizzleUserRepository(db)

  return new RecordActivityLogUseCase(activityLogRepository, userRepository)
}
