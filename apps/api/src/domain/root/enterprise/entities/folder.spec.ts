import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
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
    expect(folder.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime())
  })
})
