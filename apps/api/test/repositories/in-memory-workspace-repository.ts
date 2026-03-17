import type { WorkspaceRepository } from '@/domain/root/application/repositories/workspace-repository.ts'
import { Workspace } from '@/domain/root/enterprise/entities/workspace.ts'
import type { InMemoryItemRepository } from './in-memory-item-repository.ts'
import type { InMemoryWorkspaceMemberRepository } from './in-memory-workspace-member-repository.ts'

export class InMemoryWorkspaceRepository implements WorkspaceRepository {
  items: Workspace[] = []

  constructor(
    private readonly itemRepository?: InMemoryItemRepository,
    private readonly workspaceMemberRepository?: InMemoryWorkspaceMemberRepository,
  ) {}

  async findById(userId: string, id: string): Promise<Workspace | null> {
    return (
      this.items.find(
        (workspace) =>
          workspace.id.toString() === id && workspace.userId === userId,
      ) ?? null
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
    const matched = this.items.filter((workspace) =>
      ids.includes(workspace.id.toString()),
    )

    return matched.map((workspace) => {
      const itemCount = this.itemRepository
        ? this.itemRepository.items.filter(
            (item) => item.workspaceId === workspace.id.toString(),
          ).length
        : workspace.itemCount

      const memberCount = this.workspaceMemberRepository
        ? this.workspaceMemberRepository.items.filter(
            (member) => member.workspaceId === workspace.id.toString(),
          ).length
        : workspace.memberCount

      return Workspace.create(
        {
          name: workspace.name,
          userId: workspace.userId,
          itemCount,
          memberCount,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        },
        workspace.id,
      )
    })
  }
}
