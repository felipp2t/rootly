import { makeUser } from '@test/factories/make-user.ts'
import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { makeWorkspaceMember } from '@test/factories/make-workspace-member.ts'
import { InMemoryWorkspaceMemberRepository } from '@test/repositories/in-memory-workspace-member-repository.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { InMemoryWorkspaceRoleRepository } from '@test/repositories/in-memory-workspace-role-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { RoleInUseError } from '@/core/errors/errors/role-in-use-error.ts'
import { WorkspaceRole } from '../../enterprise/entities/workspace-role.ts'
import { DeleteRoleUseCase } from './delete-role.ts'

let workspaceRepository: InMemoryWorkspaceRepository
let workspaceRoleRepository: InMemoryWorkspaceRoleRepository
let workspaceMemberRepository: InMemoryWorkspaceMemberRepository
let sut: DeleteRoleUseCase

describe('DeleteRole', () => {
  beforeEach(() => {
    workspaceRepository = new InMemoryWorkspaceRepository()
    workspaceRoleRepository = new InMemoryWorkspaceRoleRepository()
    workspaceMemberRepository = new InMemoryWorkspaceMemberRepository()
    sut = new DeleteRoleUseCase(
      workspaceRoleRepository,
      workspaceRepository,
      workspaceMemberRepository,
    )
  })

  it('should be able to delete a role', {
    tags: ['delete-role'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: role.id.toString(),
    })

    expect(response.isRight()).toBe(true)
    expect(response.value).toBeNull()
    expect(workspaceRoleRepository.items).toHaveLength(0)
  })

  it('should remove only the targeted role from the repository', {
    tags: ['delete-role'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const roleA = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    const roleB = WorkspaceRole.create({
      name: 'Designer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(roleA, roleB)

    await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: roleA.id.toString(),
    })

    expect(workspaceRoleRepository.items).toHaveLength(1)
    expect(workspaceRoleRepository.items[0].name).toBe('Designer')
  })

  it('should return ResourceNotFoundError when the workspace does not exist', {
    tags: ['delete-role'],
  }, async () => {
    const response = await sut.execute({
      userId: makeUser().id.toString(),
      workspaceId: 'non-existent-workspace-id',
      roleId: 'any-role-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the workspace belongs to a different user', {
    tags: ['delete-role'],
  }, async () => {
    const owner = makeUser()
    const other = makeUser()
    const workspace = makeWorkspace({ userId: owner.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    const response = await sut.execute({
      userId: other.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: role.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the role does not exist', {
    tags: ['delete-role'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: 'non-existent-role-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when the role belongs to a different workspace', {
    tags: ['delete-role'],
  }, async () => {
    const user = makeUser()
    const workspaceA = makeWorkspace({ userId: user.id.toString() })
    const workspaceB = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspaceA, workspaceB)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspaceB.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspaceA.id.toString(),
      roleId: role.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return RoleInUseError when a member is assigned to the role', {
    tags: ['delete-role'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    const member = makeWorkspaceMember({
      userId: makeUser().id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: role.id.toString(),
    })
    workspaceMemberRepository.items.push(member)

    const response = await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: role.id.toString(),
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(RoleInUseError)
    expect(workspaceRoleRepository.items).toHaveLength(1)
  })

  it('should tag the role-deleted event with the caller as actorId', {
    tags: ['delete-role'],
  }, async () => {
    const user = makeUser()
    const workspace = makeWorkspace({ userId: user.id.toString() })
    workspaceRepository.items.push(workspace)

    const role = WorkspaceRole.create({
      name: 'Developer',
      workspaceId: workspace.id.toString(),
    })
    workspaceRoleRepository.items.push(role)

    await sut.execute({
      userId: user.id.toString(),
      workspaceId: workspace.id.toString(),
      roleId: role.id.toString(),
    })

    const event = role.domainEvents.at(-1)
    expect(event).toMatchObject({ actorId: user.id.toString() })
  })
})
