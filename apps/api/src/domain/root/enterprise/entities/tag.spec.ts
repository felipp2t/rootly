import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { Tag } from './tag.ts'

describe('Tag', () => {
  it('should create a tag with default timestamps', () => {
    const before = new Date()
    const tag = Tag.create({
      name: 'backend',
      color: 'blue',
      workspaceId: 'ws-1',
    })
    const after = new Date()

    expect(tag.name).toBe('backend')
    expect(tag.color).toBe('blue')
    expect(tag.workspaceId).toBe('ws-1')
    expect(tag.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(tag.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    expect(tag.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(tag.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should create a tag with explicit timestamps', () => {
    const createdAt = new Date('2024-01-01')
    const updatedAt = new Date('2024-01-02')

    const tag = Tag.create({
      name: 'frontend',
      color: 'green',
      workspaceId: 'ws-2',
      createdAt,
      updatedAt,
    })

    expect(tag.createdAt).toEqual(createdAt)
    expect(tag.updatedAt).toEqual(updatedAt)
  })

  it('should create a tag with a provided id', () => {
    const id = new UniqueEntityID('fixed-id')
    const tag = Tag.create({ name: 'ops', color: 'red', workspaceId: 'ws-1' }, id)

    expect(tag.id.toString()).toBe('fixed-id')
  })

  it('should update name and touch updatedAt', () => {
    const tag = Tag.create({ name: 'old', color: 'purple', workspaceId: 'ws-1' })
    const beforeUpdate = tag.updatedAt

    tag.name = 'new'

    expect(tag.name).toBe('new')
    expect(tag.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime())
  })

  it('should update color and touch updatedAt', () => {
    const tag = Tag.create({ name: 'infra', color: 'blue', workspaceId: 'ws-1' })
    const beforeUpdate = tag.updatedAt

    tag.color = 'yellow'

    expect(tag.color).toBe('yellow')
    expect(tag.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime())
  })

  it('should support all valid colors', () => {
    const colors = ['blue', 'green', 'orange', 'purple', 'red', 'yellow'] as const

    for (const color of colors) {
      const tag = Tag.create({ name: 'test', color, workspaceId: 'ws-1' })
      expect(tag.color).toBe(color)
    }
  })
})
