import { OnMemberActivity } from '@/domain/activity/application/subscribers/on-member-activity.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleUserRepository } from '@/infra/db/drizzle/repositories/user-respository.ts'
import { DrizzleWorkspaceRoleRepository } from '@/infra/db/drizzle/repositories/workspace-role-repository.ts'
import { makeRecordActivityLogUseCase } from './make-record-activity-log-use-case.ts'

export function makeOnMemberActivity() {
  const userRepository = new DrizzleUserRepository(db)
  const workspaceRoleRepository = new DrizzleWorkspaceRoleRepository(db)
  const recordActivityLog = makeRecordActivityLogUseCase()

  return new OnMemberActivity(
    recordActivityLog,
    userRepository,
    workspaceRoleRepository,
  )
}
