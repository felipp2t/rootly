import type { WorkspaceRoleRepository } from '@/domain/root/application/repositories/workspace-role-repository.ts'
import type { WorkspaceRole } from '@/domain/root/enterprise/entities/workspace-role.ts'

export class InMemoryWorkspaceRoleRepository implements WorkspaceRoleRepository {
  items: WorkspaceRole[] = []

  async findById(id: string): Promise<WorkspaceRole | null> {
    return this.items.find((role) => role.id.toString() === id) ?? null
  }

  async findByWorkspaceId(workspaceId: string): Promise<WorkspaceRole[]> {
    return this.items.filter((role) => role.workspaceId === workspaceId)
  }

  async findByWorkspaceIdAndName(workspaceId: string, name: string): Promise<WorkspaceRole | null> {
    return (
      this.items.find(
        (role) => role.workspaceId === workspaceId && role.name === name,
      ) ?? null
    )
  }

  async findMany(name?: string): Promise<WorkspaceRole[]> {
    if (name === undefined) return [...this.items]
    return this.items.filter((role) => role.name === name)
  }

  async create(workspace: WorkspaceRole): Promise<void> {
    this.items.push(workspace)
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((role) => role.id.toString() === id)
    if (index !== -1) {
      this.items.splice(index, 1)
    }
  }
}
