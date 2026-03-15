import { type Either, right } from '@/core/types/either.ts'
import {
  permissionResource,
  RolePermission,
} from '../../enterprise/entities/role-permission.ts'
import { Workspace } from '../../enterprise/entities/workspace.ts'
import { WorkspaceMember } from '../../enterprise/entities/workspace-member.ts'
import { WorkspaceRole } from '../../enterprise/entities/workspace-role.ts'
import type { RolePermissionRepository } from '../repositories/role-permission-repository.ts'
import type { WorkspaceMemberRepository } from '../repositories/workspace-member-repository.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'
import type { WorkspaceRoleRepository } from '../repositories/workspace-role-repository.ts'

interface CreateWorkspaceUseCaseRequest {
  name: string
  userId: string
}

type CreateWorkspaceUseCaseResponse = Either<undefined, { workspaceId: string }>

export class CreateWorkspaceUseCase {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    private readonly workspaceRoleRepository: WorkspaceRoleRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  async execute({
    name,
    userId,
  }: CreateWorkspaceUseCaseRequest): Promise<CreateWorkspaceUseCaseResponse> {
    const workspace = Workspace.create({
      name,
      userId,
    })

    await this.workspaceRepository.create(workspace)

    const workspaceRole = WorkspaceRole.create({
      name: 'Owner',
      workspaceId: workspace.id.toString(),
    })

    await this.workspaceRoleRepository.create(workspaceRole)

    const workspaceMember = WorkspaceMember.create({
      roleId: workspaceRole.id.toString(),
      userId,
      workspaceId: workspace.id.toString(),
    })

    await this.workspaceMemberRepository.create(workspaceMember)

    for (const resource of permissionResource) {
      const rolePermission = RolePermission.create({
        roleId: workspaceRole.id.toString(),
        resource,
        action: 'all',
      })

      await this.rolePermissionRepository.create(rolePermission)
    }

    return right({ workspaceId: workspace.id.toString() })
  }
}
