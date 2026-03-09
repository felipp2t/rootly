import type {
  WorkspaceInvite,
  WorkspaceInviteStatus,
} from '../../enterprise/entities/workspace-invite.ts'

export abstract class WorkspaceInviteRepository {
  abstract findById(id: string): Promise<WorkspaceInvite | null>
  abstract findMany(
    status?: WorkspaceInviteStatus[],
  ): Promise<WorkspaceInvite[]>
  abstract create(workspace: WorkspaceInvite): Promise<void>
  abstract revoke(id: string): Promise<void>
}
