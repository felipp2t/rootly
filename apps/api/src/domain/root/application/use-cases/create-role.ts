import type { BaseError } from '@/core/errors/base-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import { WorkspaceRole } from '../../enterprise/entities/workspace-role.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'
import type { WorkspaceRoleRepository } from '../repositories/workspace-role-repository.ts'
import { RoleAlreadyExistsError } from './errors/role-already-exists-error.ts'

const RESERVED_ROLE_NAMES = ['Owner']

interface CreateRoleUseCaseRequest {
  userId: string
  name: string
  workspaceId: string
}

type CreateRoleUseCaseResponse = Either<BaseError, { roleId: string }>

export class CreateRoleUseCase {
  constructor(
    private readonly workspaceRoleRepository: WorkspaceRoleRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute({
    userId,
    name,
    workspaceId,
  }: CreateRoleUseCaseRequest): Promise<CreateRoleUseCaseResponse> {
    const workspace = await this.workspaceRepository.findById(
      userId,
      workspaceId,
    )

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    if (RESERVED_ROLE_NAMES.includes(name)) {
      return left(new RoleAlreadyExistsError(name))
    }

    const existing =
      await this.workspaceRoleRepository.findByWorkspaceIdAndName(
        workspaceId,
        name,
      )

    if (existing) {
      return left(new RoleAlreadyExistsError(name))
    }

    const role = WorkspaceRole.create({ name, workspaceId })

    await this.workspaceRoleRepository.create(role)

    return right({ roleId: role.id.toString() })
  }
}
