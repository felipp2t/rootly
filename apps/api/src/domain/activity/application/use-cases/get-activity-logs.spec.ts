import { makeWorkspace } from '@test/factories/make-workspace.ts'
import { makeWorkspaceMember } from '@test/factories/make-workspace-member.ts'
import { InMemoryActivityLogRepository } from '@test/repositories/in-memory-activity-log-repository.ts'
import { InMemoryRolePermissionRepository } from '@test/repositories/in-memory-role-permission.ts'
import { InMemoryWorkspaceMemberRepository } from '@test/repositories/in-memory-workspace-member-repository.ts'
import { InMemoryWorkspaceRepository } from '@test/repositories/in-memory-workspace-repository.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error.ts'
import { ActivityLog } from '../../enterprise/entities/activity-log.ts'
import { GetActivityLogsUseCase } from './get-activity-logs.ts'

let workspaceRepository: InMemoryWorkspaceRepository
let workspaceMemberRepository: InMemoryWorkspaceMemberRepository
let rolePermissionRepository: InMemoryRolePermissionRepository
let activityLogRepository: InMemoryActivityLogRepository
let sut: GetActivityLogsUseCase

describe('GetActivityLogs', () => {
  beforeEach(() => {
    workspaceMemberRepository = new InMemoryWorkspaceMemberRepository()
    workspaceRepository = new InMemoryWorkspaceRepository(
      undefined,
      workspaceMemberRepository,
    )
    rolePermissionRepository = new InMemoryRolePermissionRepository()
    activityLogRepository = new InMemoryActivityLogRepository()
    sut = new GetActivityLogsUseCase(
      workspaceRepository,
      workspaceMemberRepository,
      rolePermissionRepository,
      activityLogRepository,
    )
  })

  it('should list activity logs for the owner ordered by most recent', async () => {
    const ownerId = new UniqueEntityID().toString()
    const workspace = makeWorkspace({ userId: ownerId })
    workspaceRepository.items.push(workspace)

    const older = ActivityLog.create({
      workspaceId: workspace.id.toString(),
      resourceType: 'folder',
      resourceId: 'folder-1',
      resourceName: 'Docs',
      action: 'folder_created',
      actorUserId: ownerId,
      actorName: 'Owner',
      createdAt: new Date('2024-01-01'),
    })
    const newer = ActivityLog.create({
      workspaceId: workspace.id.toString(),
      resourceType: 'item',
      resourceId: 'item-1',
      resourceName: 'Contract.pdf',
      action: 'item_created',
      actorUserId: ownerId,
      actorName: 'Owner',
      createdAt: new Date('2024-01-02'),
    })
    activityLogRepository.items.push(older, newer)

    const result = await sut.execute({
      userId: ownerId,
      workspaceId: workspace.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.items.map((log) => log.resourceId)).toEqual([
        'item-1',
        'folder-1',
      ])
    }
  })

  it('should filter activity logs by resourceType', async () => {
    const ownerId = new UniqueEntityID().toString()
    const workspace = makeWorkspace({ userId: ownerId })
    workspaceRepository.items.push(workspace)

    activityLogRepository.items.push(
      ActivityLog.create({
        workspaceId: workspace.id.toString(),
        resourceType: 'folder',
        resourceId: 'folder-1',
        resourceName: 'Docs',
        action: 'folder_created',
        actorUserId: ownerId,
        actorName: 'Owner',
      }),
      ActivityLog.create({
        workspaceId: workspace.id.toString(),
        resourceType: 'item',
        resourceId: 'item-1',
        resourceName: 'Contract.pdf',
        action: 'item_created',
        actorUserId: ownerId,
        actorName: 'Owner',
      }),
    )

    const result = await sut.execute({
      userId: ownerId,
      workspaceId: workspace.id.toString(),
      resourceType: 'item',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.items).toHaveLength(1)
      expect(result.value.items[0].resourceId).toBe('item-1')
    }
  })

  it('should filter activity logs by resourceId', async () => {
    const ownerId = new UniqueEntityID().toString()
    const workspace = makeWorkspace({ userId: ownerId })
    workspaceRepository.items.push(workspace)

    activityLogRepository.items.push(
      ActivityLog.create({
        workspaceId: workspace.id.toString(),
        resourceType: 'folder',
        resourceId: 'folder-1',
        resourceName: 'Docs',
        action: 'folder_created',
        actorUserId: ownerId,
        actorName: 'Owner',
      }),
      ActivityLog.create({
        workspaceId: workspace.id.toString(),
        resourceType: 'folder',
        resourceId: 'folder-1',
        resourceName: 'Docs',
        action: 'folder_renamed',
        actorUserId: ownerId,
        actorName: 'Owner',
      }),
      ActivityLog.create({
        workspaceId: workspace.id.toString(),
        resourceType: 'folder',
        resourceId: 'folder-2',
        resourceName: 'Other',
        action: 'folder_created',
        actorUserId: ownerId,
        actorName: 'Owner',
      }),
    )

    const result = await sut.execute({
      userId: ownerId,
      workspaceId: workspace.id.toString(),
      resourceId: 'folder-1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.items).toHaveLength(2)
      expect(
        result.value.items.every((log) => log.resourceId === 'folder-1'),
      ).toBe(true)
    }
  })

  it('should return NotAllowedError when the caller lacks activity:read permission', async () => {
    const ownerId = new UniqueEntityID().toString()
    const workspace = makeWorkspace({ userId: ownerId })
    workspaceRepository.items.push(workspace)

    const memberId = new UniqueEntityID().toString()
    workspaceMemberRepository.items.push(
      makeWorkspaceMember({
        userId: memberId,
        workspaceId: workspace.id.toString(),
        roleId: new UniqueEntityID().toString(),
      }),
    )

    const result = await sut.execute({
      userId: memberId,
      workspaceId: workspace.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should return ResourceNotFoundError when the workspace is not accessible', async () => {
    const result = await sut.execute({
      userId: new UniqueEntityID().toString(),
      workspaceId: new UniqueEntityID().toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should paginate results and expose pagination metadata', async () => {
    const ownerId = new UniqueEntityID().toString()
    const workspace = makeWorkspace({ userId: ownerId })
    workspaceRepository.items.push(workspace)

    for (let i = 0; i < 3; i++) {
      activityLogRepository.items.push(
        ActivityLog.create({
          workspaceId: workspace.id.toString(),
          resourceType: 'folder',
          resourceId: `folder-${i}`,
          resourceName: 'Docs',
          action: 'folder_created',
          actorUserId: ownerId,
          actorName: 'Owner',
        }),
      )
    }

    const result = await sut.execute({
      userId: ownerId,
      workspaceId: workspace.id.toString(),
      page: 1,
      limit: 2,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.items).toHaveLength(2)
      expect(result.value.total).toBe(3)
      expect(result.value.page).toBe(1)
      expect(result.value.limit).toBe(2)
      expect(result.value.totalPages).toBe(2)
    }
  })
})
