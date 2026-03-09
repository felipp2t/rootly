import type { WorkspaceInviteRepository } from '@/domain/root/application/repositories/workspace-invite-repository.ts'
import {
  workspaceInviteStatus,
  type WorkspaceInvite,
  type WorkspaceInviteStatus,
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

  async create(workspace: WorkspaceInvite): Promise<void> {
    this.items.push(workspace)
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
