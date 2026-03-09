import type { WorkspaceRoleRepository } from '@/domain/root/application/repositories/workspace-role-repository.ts'
import type { WorkspaceRole } from '@/domain/root/enterprise/entities/workspace-role.ts'

export class InMemoryWorkspaceRoleRepository implements WorkspaceRoleRepository {
  items: WorkspaceRole[] = []

  async findById(id: string): Promise<WorkspaceRole | null> {
    return (
      this.items.find((workspace) => workspace.id.toString() === id) ?? null
    )
  }

  async findByWorkspaceId(workspaceId: string): Promise<WorkspaceRole | null> {
    return this.items.find((workspaceRole) => workspaceRole.id.toString() === workspaceId) ?? null
  }

  async findMany(name?: string): Promise<WorkspaceRole[]> {
    if (name === undefined) return [...this.items]
    return this.items.filter((workspace) => workspace.name === name)
  }

  async create(workspace: WorkspaceRole): Promise<void> {
    this.items.push(workspace)
  }

  async delete(id: string): Promise<void> {
    const workspaceIndex = this.items.findIndex(
      (workspace) => workspace.id.toString() === id,
    )

    if (workspaceIndex !== -1) {
      this.items.splice(workspaceIndex, 1)
    }
  }
}
