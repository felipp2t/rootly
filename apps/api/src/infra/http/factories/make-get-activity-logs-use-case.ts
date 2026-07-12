import { GetActivityLogsUseCase } from '@/domain/activity/application/use-cases/get-activity-logs.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleActivityLogRepository } from '@/infra/db/drizzle/repositories/activity-log-repository.ts'
import { DrizzleRolePermissionRepository } from '@/infra/db/drizzle/repositories/role-permission-repository.ts'
import { DrizzleWorkspaceMemberRepository } from '@/infra/db/drizzle/repositories/workspace-member-repository.ts'
import { DrizzleWorkspaceRepository } from '@/infra/db/drizzle/repositories/workspace-repository.ts'

export function makeGetActivityLogsUseCase() {
  return new GetActivityLogsUseCase(
    new DrizzleWorkspaceRepository(db),
    new DrizzleWorkspaceMemberRepository(db),
    new DrizzleRolePermissionRepository(db),
    new DrizzleActivityLogRepository(db),
  )
}
