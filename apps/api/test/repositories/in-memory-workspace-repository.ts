import type { WorkspaceRepository } from '@/domain/root/application/repositories/workspace-repository.ts'
import type { Workspace } from '@/domain/root/enterprise/entities/workspace.ts'

export class InMemoryWorkspaceRepository implements WorkspaceRepository {
  items: Workspace[] = []

  async findById(id: string): Promise<Workspace | null> {
    return (
      this.items.find((workspace) => workspace.id.toString() === id) ?? null
    )
  }

  async findByName(name: string): Promise<Workspace | null> {
    return this.items.find((workspace) => workspace.name === name) ?? null
  }

  async findMany(userId?: string): Promise<Workspace[]> {
    if (userId === undefined) return [...this.items]
    return this.items.filter((workspace) => workspace.userId === userId)
  }

  async create(workspace: Workspace): Promise<void> {
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

  async findManyByIds(ids: string[]): Promise<Workspace[]> {
    return this.items.filter((workspace) =>
      ids.includes(workspace.id.toString()),
    )
  }
}
