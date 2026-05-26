import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { Workspace } from './workspace.ts'

describe('Workspace', () => {
  it('should create a workspace with default values', () => {
    const before = new Date()
    const workspace = Workspace.create({ name: 'My Workspace', userId: 'user-1' })
    const after = new Date()

    expect(workspace.name).toBe('My Workspace')
    expect(workspace.userId).toBe('user-1')
    expect(workspace.itemCount).toBe(0)
    expect(workspace.memberCount).toBe(0)
    expect(workspace.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(workspace.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    expect(workspace.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(workspace.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should create a workspace with explicit counts', () => {
    const workspace = Workspace.create({
      name: 'Full WS',
      userId: 'user-1',
      itemCount: 5,
      memberCount: 3,
    })

    expect(workspace.itemCount).toBe(5)
    expect(workspace.memberCount).toBe(3)
  })

  it('should create a workspace with explicit timestamps', () => {
    const createdAt = new Date('2024-01-01')
    const updatedAt = new Date('2024-01-02')

    const workspace = Workspace.create({
      name: 'WS',
      userId: 'user-1',
      createdAt,
      updatedAt,
    })

    expect(workspace.createdAt).toEqual(createdAt)
    expect(workspace.updatedAt).toEqual(updatedAt)
  })

  it('should create a workspace with a provided id', () => {
    const id = new UniqueEntityID('ws-fixed-id')
    const workspace = Workspace.create({ name: 'Fixed', userId: 'user-1' }, id)

    expect(workspace.id.toString()).toBe('ws-fixed-id')
  })

  it('should update name and touch updatedAt', () => {
    const workspace = Workspace.create({ name: 'Old Name', userId: 'user-1' })
    const beforeUpdate = workspace.updatedAt

    workspace.name = 'New Name'

    expect(workspace.name).toBe('New Name')
    expect(workspace.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime())
  })
})
