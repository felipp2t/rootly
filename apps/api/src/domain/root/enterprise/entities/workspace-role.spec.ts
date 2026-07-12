import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { WorkspaceRole } from './workspace-role.ts'

describe('WorkspaceRole', () => {
  it('should create a workspace role with default timestamps', () => {
    const before = new Date()
    const role = WorkspaceRole.create({ name: 'Member', workspaceId: 'ws-1' })
    const after = new Date()

    expect(role.name).toBe('Member')
    expect(role.workspaceId).toBe('ws-1')
    expect(role.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(role.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    expect(role.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(role.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should create a workspace role with explicit timestamps', () => {
    const createdAt = new Date('2024-01-01')
    const updatedAt = new Date('2024-01-02')

    const role = WorkspaceRole.create({
      name: 'Owner',
      workspaceId: 'ws-2',
      createdAt,
      updatedAt,
    })

    expect(role.createdAt).toEqual(createdAt)
    expect(role.updatedAt).toEqual(updatedAt)
  })

  it('should create a workspace role with a provided id', () => {
    const id = new UniqueEntityID('role-fixed-id')
    const role = WorkspaceRole.create(
      { name: 'Admin', workspaceId: 'ws-1' },
      id,
    )

    expect(role.id.toString()).toBe('role-fixed-id')
  })

  it('should update name and touch updatedAt', () => {
    const role = WorkspaceRole.create({ name: 'Old Name', workspaceId: 'ws-1' })
    const beforeUpdate = role.updatedAt

    role.name = 'New Name'

    expect(role.name).toBe('New Name')
    expect(role.updatedAt.getTime()).toBeGreaterThanOrEqual(
      beforeUpdate.getTime(),
    )
  })

  it('should expose workspaceId', () => {
    const role = WorkspaceRole.create({ name: 'Viewer', workspaceId: 'ws-abc' })

    expect(role.workspaceId).toBe('ws-abc')
  })
})
