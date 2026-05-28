import type { BaseError } from '@/core/errors/base-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { WorkspaceRole } from '../../enterprise/entities/workspace-role.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'
import type { WorkspaceRoleRepository } from '../repositories/workspace-role-repository.ts'

interface GetRolesUseCaseRequest {
  userId: string
  workspaceId: string
}

type GetRolesUseCaseResponse = Either<BaseError, { roles: WorkspaceRole[] }>

export class GetRolesUseCase {
  constructor(
    private readonly workspaceRoleRepository: WorkspaceRoleRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute({
    userId,
    workspaceId,
  }: GetRolesUseCaseRequest): Promise<GetRolesUseCaseResponse> {
    const workspace = await this.workspaceRepository.findById(userId, workspaceId)

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    const roles = await this.workspaceRoleRepository.findByWorkspaceId(workspaceId)

    return right({ roles })
  }
}
