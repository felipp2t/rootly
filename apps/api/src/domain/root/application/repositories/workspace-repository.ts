import type { Workspace } from '../../enterprise/entities/workspace.ts'

export abstract class WorkspaceRepository {
  abstract findById(userId: string, id: string): Promise<Workspace | null>
  abstract findByName(name: string): Promise<Workspace | null>
  abstract findManyByIds(ids: string[]): Promise<Workspace[]>
  abstract findMany(userId?: string): Promise<Workspace[]>
  abstract create(workspace: Workspace): Promise<void>
  abstract delete(id: string): Promise<void>
}
