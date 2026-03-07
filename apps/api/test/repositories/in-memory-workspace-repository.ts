import type { WorkspaceRepository } from '@/domain/root/application/repositories/workspace-repository.ts'
import type { Workspace } from '@/domain/root/enterprise/entities/workspace.ts'

export class InMemoryWorkspaceRepository implements WorkspaceRepository {
  items: Workspace[] = []

  async findById(id: string): Promise<Workspace | null> {
    return (
      this.items.find((Workspace) => Workspace.id.toString() === id) ?? null
    )
  }

  async findByName(name: string): Promise<Workspace | null> {
    return this.items.find((Workspace) => Workspace.name === name) ?? null
  }

  async findManyByUserId(userId: string): Promise<Workspace[]> {
    return this.items.filter((Workspace) => Workspace.userId === userId)
  }

  async create(Workspace: Workspace): Promise<void> {
    this.items.push(Workspace)
  }
  async delete(id: string): Promise<void> {
    const WorkspaceIndex = this.items.findIndex(
      (Workspace) => Workspace.id.toString() === id,
    )

    if (WorkspaceIndex !== -1) {
      this.items.splice(WorkspaceIndex, 1)
    }
  }
}
