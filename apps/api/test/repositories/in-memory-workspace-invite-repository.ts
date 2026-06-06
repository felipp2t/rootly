import type { WorkspaceInviteRepository } from '@/domain/root/application/repositories/workspace-invite-repository.ts'
import {
  type WorkspaceInvite,
  type WorkspaceInviteStatus,
  workspaceInviteStatus,
} from '@/domain/root/enterprise/entities/workspace-invite.ts'

export class InMemoryWorkspaceInviteRepository
  implements WorkspaceInviteRepository
{
  items: WorkspaceInvite[] = []

  async findById(id: string): Promise<WorkspaceInvite | null> {
    return (
      this.items.find((workspace) => workspace.id.toString() === id) ?? null
    )
  }

  async findMany(status?: WorkspaceInviteStatus[]): Promise<WorkspaceInvite[]> {
    if (status === undefined) return [...this.items]
    return this.items.filter((workspace) => status.includes(workspace.status))
  }

  async findManyByWorkspaceId(
    workspaceId: string,
    status?: WorkspaceInviteStatus[],
  ): Promise<WorkspaceInvite[]> {
    return this.items.filter(
      (invite) =>
        invite.workspaceId === workspaceId &&
        (status === undefined || status.includes(invite.status)),
    )
  }

  async create(workspace: WorkspaceInvite): Promise<void> {
    this.items.push(workspace)
  }

  async save(workspace: WorkspaceInvite): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === workspace.id.toString(),
    )

    if (index !== -1) {
      this.items[index] = workspace
    }
  }

  async revoke(id: string): Promise<void> {
    const workspaceIndex = this.items.findIndex(
      (workspace) => workspace.id.toString() === id,
    )

    if (workspaceIndex !== -1) {
      this.items[workspaceIndex].status = workspaceInviteStatus.REVOKED
    }
  }
}
