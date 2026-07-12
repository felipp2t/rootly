import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { WorkspaceRenamedEvent } from '../events/workspace-renamed-event.ts'
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

  it('should register a WorkspaceRenamedEvent with before/after and actorId on rename', () => {
    const workspace = Workspace.create(
      { name: 'Old Name', userId: 'user-1' },
      new UniqueEntityID('ws-1'),
    )

    workspace.rename('New Name', 'user-1')

    expect(workspace.domainEvents).toHaveLength(1)
    const event = workspace.domainEvents[0] as WorkspaceRenamedEvent
    expect(event).toBeInstanceOf(WorkspaceRenamedEvent)
    expect(event.changes).toEqual({ before: 'Old Name', after: 'New Name' })
    expect(event.actorId).toBe('user-1')
  })

  it('should not register a WorkspaceRenamedEvent when the name does not change', () => {
    const workspace = Workspace.create(
      { name: 'Same Name', userId: 'user-1' },
      new UniqueEntityID('ws-1'),
    )

    workspace.rename('Same Name', 'user-1')

    expect(workspace.domainEvents).toHaveLength(0)
  })

  it('should register a WorkspaceRenamedEvent with undefined actorId when not provided', () => {
    const workspace = Workspace.create(
      { name: 'Old Name', userId: 'user-1' },
      new UniqueEntityID('ws-1'),
    )

    workspace.rename('New Name')

    const event = workspace.domainEvents[0] as WorkspaceRenamedEvent
    expect(event.actorId).toBeUndefined()
  })
})
