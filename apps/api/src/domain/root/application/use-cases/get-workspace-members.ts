import type { BaseError } from '@/core/errors/base-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { type Either, left, right } from '@/core/types/either.ts'
import type { UserRepository } from '../repositories/user-repository.ts'
import type { WorkspaceMemberRepository } from '../repositories/workspace-member-repository.ts'
import type { WorkspaceRepository } from '../repositories/workspace-repository.ts'
import type { WorkspaceRoleRepository } from '../repositories/workspace-role-repository.ts'

interface GetWorkspaceMembersUseCaseRequest {
  userId: string
  workspaceId: string
}

interface WorkspaceMemberView {
  id: string
  userId: string
  name: string
  email: string
  roleId: string
  roleName: string
}

type GetWorkspaceMembersUseCaseResponse = Either<
  BaseError,
  { members: WorkspaceMemberView[] }
>

export class GetWorkspaceMembersUseCase {
  constructor(
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly userRepository: UserRepository,
    private readonly workspaceRoleRepository: WorkspaceRoleRepository,
  ) {}

  async execute({
    userId,
    workspaceId,
  }: GetWorkspaceMembersUseCaseRequest): Promise<GetWorkspaceMembersUseCaseResponse> {
    const workspace = await this.workspaceRepository.findById(
      userId,
      workspaceId,
    )

    if (!workspace) {
      return left(new ResourceNotFoundError('Workspace'))
    }

    const members =
      await this.workspaceMemberRepository.findManyByWorkspaceId(workspaceId)

    const views = await Promise.all(
      members.map(async (member) => {
        const [user, role] = await Promise.all([
          this.userRepository.findById(member.userId),
          this.workspaceRoleRepository.findById(member.roleId),
        ])

        if (!user || !role) return null

        return {
          id: member.id.toString(),
          userId: member.userId,
          name: user.name,
          email: user.email,
          roleId: member.roleId,
          roleName: role.name,
        } satisfies WorkspaceMemberView
      }),
    )

    return right({
      members: views.filter(
        (view): view is WorkspaceMemberView => view !== null,
      ),
    })
  }
}
