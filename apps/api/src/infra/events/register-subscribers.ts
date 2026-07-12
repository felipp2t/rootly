import { OnFolderActivity } from '@/domain/activity/application/subscribers/on-folder-activity.ts'
import { OnItemActivity } from '@/domain/activity/application/subscribers/on-item-activity.ts'
import { OnRoleActivity } from '@/domain/activity/application/subscribers/on-role-activity.ts'
import { OnWorkspaceActivity } from '@/domain/activity/application/subscribers/on-workspace-activity.ts'
import { OnUserInvited } from '@/domain/notification/application/subsribers/on-user-invited.ts'
import { makeOnMemberActivity } from '../http/factories/make-on-member-activity.ts'
import { makeRecordActivityLogUseCase } from '../http/factories/make-record-activity-log-use-case.ts'
import { makeSendNotificationUseCase } from '../http/factories/make-send-notification-use-case.ts'

export function registerSubscribers() {
  new OnUserInvited(makeSendNotificationUseCase())
  new OnFolderActivity(makeRecordActivityLogUseCase())
  new OnItemActivity(makeRecordActivityLogUseCase())
  new OnWorkspaceActivity(makeRecordActivityLogUseCase())
  new OnRoleActivity(makeRecordActivityLogUseCase())
  makeOnMemberActivity()
}
