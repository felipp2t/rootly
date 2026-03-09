import type { WorkspaceRole } from "../../enterprise/entities/workspace-role.ts";

export abstract class WorkspaceRoleRepository {
  abstract findById(id: string): Promise<WorkspaceRole | null>
  abstract findByWorkspaceId(workspaceId: string): Promise<WorkspaceRole | null>
  abstract findMany(name?: string): Promise<WorkspaceRole[]>
  abstract create(workspace: WorkspaceRole): Promise<void>
  abstract delete(id: string): Promise<void>
}
