import { DomainEvents } from '@/core/events/domain-events.ts'
import type { EventHandler } from '@/core/events/event-handler.ts'
import type { UserRepository } from '@/domain/root/application/repositories/user-repository.ts'
import type { WorkspaceRoleRepository } from '@/domain/root/application/repositories/workspace-role-repository.ts'
import { InviteDeclinedEvent } from '@/domain/root/enterprise/events/invite-declined-event.ts'
import { InviteRevokedEvent } from '@/domain/root/enterprise/events/invite-revoked-event.ts'
import { MemberJoinedEvent } from '@/domain/root/enterprise/events/member-joined-event.ts'
import { MemberRemovedEvent } from '@/domain/root/enterprise/events/member-removed-event.ts'
import { MemberRoleChangedEvent } from '@/domain/root/enterprise/events/member-role-changed-event.ts'
import { UserInvitedEvent } from '@/domain/root/enterprise/events/user-invited-event.ts'
import type { RecordActivityLogUseCase } from '../use-cases/record-activity-log.ts'

export class OnMemberActivity implements EventHandler {
  constructor(
    private readonly recordActivityLog: RecordActivityLogUseCase,
    private readonly userRepository: UserRepository,
    private readonly workspaceRoleRepository: WorkspaceRoleRepository,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onMemberInvited.bind(this),
      UserInvitedEvent.name,
    )
    DomainEvents.register(
      this.onMemberJoined.bind(this),
      MemberJoinedEvent.name,
    )
    DomainEvents.register(
      this.onMemberRoleChanged.bind(this),
      MemberRoleChangedEvent.name,
    )
    DomainEvents.register(
      this.onMemberRemoved.bind(this),
      MemberRemovedEvent.name,
    )
    DomainEvents.register(
      this.onInviteRevoked.bind(this),
      InviteRevokedEvent.name,
    )
    DomainEvents.register(
      this.onInviteDeclined.bind(this),
      InviteDeclinedEvent.name,
    )
  }

  private async onMemberInvited({ workspaceInvite }: UserInvitedEvent) {
    const target = await this.userRepository.findById(
      workspaceInvite.invitedUserId,
    )
    if (!target) return

    await this.recordActivityLog.execute({
      workspaceId: workspaceInvite.workspaceId,
      resourceType: 'member',
      resourceId: target.id.toString(),
      resourceName: target.name,
      action: 'member_invited',
      actorUserId: workspaceInvite.invitedByUserId,
    })
  }

  private async onMemberJoined({ workspaceMember }: MemberJoinedEvent) {
    const target = await this.userRepository.findById(workspaceMember.userId)
    if (!target) return

    await this.recordActivityLog.execute({
      workspaceId: workspaceMember.workspaceId,
      resourceType: 'member',
      resourceId: target.id.toString(),
      resourceName: target.name,
      action: 'member_joined',
      actorUserId: workspaceMember.userId,
    })
  }

  private async onMemberRoleChanged({
    workspaceMember,
    changes,
    actorId,
  }: MemberRoleChangedEvent) {
    if (!actorId) return

    const target = await this.userRepository.findById(workspaceMember.userId)
    if (!target) return

    const [beforeRole, afterRole] = await Promise.all([
      this.workspaceRoleRepository.findById(changes.before),
      this.workspaceRoleRepository.findById(changes.after),
    ])

    await this.recordActivityLog.execute({
      workspaceId: workspaceMember.workspaceId,
      resourceType: 'member',
      resourceId: target.id.toString(),
      resourceName: target.name,
      action: 'member_role_changed',
      actorUserId: actorId,
      metadata: {
        before: { role: beforeRole?.name ?? changes.before },
        after: { role: afterRole?.name ?? changes.after },
      },
    })
  }

  private async onMemberRemoved({
    workspaceMember,
    actorId,
  }: MemberRemovedEvent) {
    if (!actorId) return

    const target = await this.userRepository.findById(workspaceMember.userId)
    if (!target) return

    await this.recordActivityLog.execute({
      workspaceId: workspaceMember.workspaceId,
      resourceType: 'member',
      resourceId: target.id.toString(),
      resourceName: target.name,
      action: 'member_removed',
      actorUserId: actorId,
    })
  }

  private async onInviteRevoked({
    workspaceInvite,
    actorId,
  }: InviteRevokedEvent) {
    if (!actorId) return

    const target = await this.userRepository.findById(
      workspaceInvite.invitedUserId,
    )
    if (!target) return

    await this.recordActivityLog.execute({
      workspaceId: workspaceInvite.workspaceId,
      resourceType: 'member',
      resourceId: target.id.toString(),
      resourceName: target.name,
      action: 'member_invite_revoked',
      actorUserId: actorId,
    })
  }

  private async onInviteDeclined({
    workspaceInvite,
    actorId,
  }: InviteDeclinedEvent) {
    if (!actorId) return

    const target = await this.userRepository.findById(
      workspaceInvite.invitedUserId,
    )
    if (!target) return

    await this.recordActivityLog.execute({
      workspaceId: workspaceInvite.workspaceId,
      resourceType: 'member',
      resourceId: target.id.toString(),
      resourceName: target.name,
      action: 'member_invite_declined',
      actorUserId: actorId,
    })
  }
}
