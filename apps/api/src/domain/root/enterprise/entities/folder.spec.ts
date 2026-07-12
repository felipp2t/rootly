import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { FolderCreatedEvent } from '../events/folder-created-event.ts'
import { FolderDeletedEvent } from '../events/folder-deleted-event.ts'
import { FolderRenamedEvent } from '../events/folder-renamed-event.ts'
import { Folder } from './folder.ts'

describe('Folder', () => {
  it('should create a folder with default timestamps', () => {
    const before = new Date()
    const folder = Folder.create({ name: 'My Folder', workspaceId: 'ws-1' })
    const after = new Date()

    expect(folder.name).toBe('My Folder')
    expect(folder.workspaceId).toBe('ws-1')
    expect(folder.parentId).toBeUndefined()
    expect(folder.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(folder.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    expect(folder.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(folder.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should create a folder with explicit timestamps', () => {
    const createdAt = new Date('2024-01-01')
    const updatedAt = new Date('2024-01-02')

    const folder = Folder.create({
      name: 'Docs',
      workspaceId: 'ws-1',
      createdAt,
      updatedAt,
    })

    expect(folder.createdAt).toEqual(createdAt)
    expect(folder.updatedAt).toEqual(updatedAt)
  })

  it('should create a folder with an optional parentId', () => {
    const folder = Folder.create({
      name: 'Child',
      workspaceId: 'ws-1',
      parentId: 'parent-folder-id',
    })

    expect(folder.parentId).toBe('parent-folder-id')
  })

  it('should create a folder with a provided id', () => {
    const id = new UniqueEntityID('folder-fixed-id')
    const folder = Folder.create({ name: 'Fixed', workspaceId: 'ws-1' }, id)

    expect(folder.id.toString()).toBe('folder-fixed-id')
  })

  it('should update name and touch updatedAt', () => {
    const folder = Folder.create({ name: 'Old Name', workspaceId: 'ws-1' })
    const beforeUpdate = folder.updatedAt

    folder.name = 'New Name'

    expect(folder.name).toBe('New Name')
    expect(folder.updatedAt.getTime()).toBeGreaterThanOrEqual(
      beforeUpdate.getTime(),
    )
  })

  it('should register a FolderCreatedEvent with the provided actorId', () => {
    const folder = Folder.create(
      { name: 'My Folder', workspaceId: 'ws-1' },
      undefined,
      'user-1',
    )

    expect(folder.domainEvents).toHaveLength(1)
    const event = folder.domainEvents[0] as FolderCreatedEvent
    expect(event).toBeInstanceOf(FolderCreatedEvent)
    expect(event.actorId).toBe('user-1')
  })

  it('should register a FolderCreatedEvent with undefined actorId when not provided', () => {
    const folder = Folder.create({ name: 'My Folder', workspaceId: 'ws-1' })

    const event = folder.domainEvents[0] as FolderCreatedEvent
    expect(event.actorId).toBeUndefined()
  })

  it('should not register a domain event when rehydrated with an id', () => {
    const id = new UniqueEntityID('folder-1')
    const folder = Folder.create({ name: 'My Folder', workspaceId: 'ws-1' }, id)

    expect(folder.domainEvents).toHaveLength(0)
  })

  it('should register a FolderRenamedEvent with before/after and actorId on rename', () => {
    const folder = Folder.create(
      { name: 'Old Name', workspaceId: 'ws-1' },
      new UniqueEntityID('folder-1'),
    )

    folder.rename('New Name', 'user-1')

    expect(folder.domainEvents).toHaveLength(1)
    const event = folder.domainEvents[0] as FolderRenamedEvent
    expect(event).toBeInstanceOf(FolderRenamedEvent)
    expect(event.changes).toEqual({ before: 'Old Name', after: 'New Name' })
    expect(event.actorId).toBe('user-1')
  })

  it('should not register a FolderRenamedEvent when the name does not change', () => {
    const folder = Folder.create(
      { name: 'Same Name', workspaceId: 'ws-1' },
      new UniqueEntityID('folder-1'),
    )

    folder.rename('Same Name', 'user-1')

    expect(folder.domainEvents).toHaveLength(0)
  })

  it('should register a FolderDeletedEvent with actorId on delete', () => {
    const folder = Folder.create(
      { name: 'My Folder', workspaceId: 'ws-1' },
      new UniqueEntityID('folder-1'),
    )

    folder.delete('user-1')

    expect(folder.domainEvents).toHaveLength(1)
    const event = folder.domainEvents[0] as FolderDeletedEvent
    expect(event).toBeInstanceOf(FolderDeletedEvent)
    expect(event.actorId).toBe('user-1')
  })
})
