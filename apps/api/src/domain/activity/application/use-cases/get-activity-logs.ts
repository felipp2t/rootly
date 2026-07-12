import type { BaseError } from '@/core/errors/base-error.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { RolePermissionRepository } from '@/domain/root/application/repositories/role-permission-repository.ts'
import type { WorkspaceMemberRepository } from '@/domain/root/application/repositories/workspace-member-repository.ts'
import type { WorkspaceRepository } from '@/domain/root/application/repositories/workspace-repository.ts'
import type {
  ActivityLog,
  ActivityResourceType,
} from '../../enterprise/entities/activity-log.ts'
import type { ActivityLogRepository } from '../repositories/activity-log-repository.ts'
import { canViewActivity } from './_authorization/can-view-activity.ts'

interface GetActivityLogsUseCaseRequest {
  userId: string
  workspaceId: string
  resourceId?: string
  resourceType?: ActivityResourceType
}

type GetActivityLogsUseCaseResponse = Either<
  BaseError,
  { activityLogs: ActivityLog[] }
>

export class GetActivityLogsUseCase {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute({
    userId,
    workspaceId,
    resourceId,
    resourceType,
  }: GetActivityLogsUseCaseRequest): Promise<GetActivityLogsUseCaseResponse> {
    const workspace = await this.workspaceRepository.findById(
      userId,
      workspaceId,
    )

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    const allowed = await canViewActivity(
      { userId, workspaceId, ownerId: workspace.userId },
      this.workspaceMemberRepository,
      this.rolePermissionRepository,
    )

    if (!allowed) {
      return left(new NotAllowedError('Missing activity:read permission'))
    }

    const activityLogs = await this.activityLogRepository.findManyByWorkspaceId(
      workspaceId,
      { resourceId, resourceType },
    )

    return right({ activityLogs })
  }
}
