import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { InvalidItemTypeError } from '../validators/_errors/invalid-item-type.ts'
import { Item } from './item.ts'

describe('Item', () => {
  it('should create a text item without content', () => {
    const item = Item.create({ workspaceId: 'ws-1', type: 'text', title: 'Note' })

    expect(item.type).toBe('text')
    expect(item.title).toBe('Note')
    expect(item.content).toBeUndefined()
    expect(item.workspaceId).toBe('ws-1')
  })

  it('should create a text item with content', () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'text',
      title: 'Note',
      content: 'Some text',
    })

    expect(item.content).toBe('Some text')
  })

  it('should create a document item', () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'document',
      title: 'Doc',
      content: 'Document body',
    })

    expect(item.type).toBe('document')
  })

  it('should create a link item with a valid https url', () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'link',
      title: 'Site',
      content: 'https://example.com',
    })

    expect(item.type).toBe('link')
    expect(item.content).toBe('https://example.com')
  })

  it('should create a secret item', () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'secret',
      title: 'API Key',
      content: 'super-secret-value',
    })

    expect(item.type).toBe('secret')
  })

  it('should throw InvalidItemTypeError for link without content', () => {
    expect(() =>
      Item.create({ workspaceId: 'ws-1', type: 'link', title: 'Link' }),
    ).toThrow(InvalidItemTypeError)
  })

  it('should throw InvalidItemTypeError for link with http url', () => {
    expect(() =>
      Item.create({
        workspaceId: 'ws-1',
        type: 'link',
        title: 'Link',
        content: 'http://example.com',
      }),
    ).toThrow(InvalidItemTypeError)
  })

  it('should throw InvalidItemTypeError for link with invalid url', () => {
    expect(() =>
      Item.create({
        workspaceId: 'ws-1',
        type: 'link',
        title: 'Link',
        content: 'not-a-url',
      }),
    ).toThrow(InvalidItemTypeError)
  })

  it('should throw InvalidItemTypeError for document without content', () => {
    expect(() =>
      Item.create({ workspaceId: 'ws-1', type: 'document', title: 'Doc' }),
    ).toThrow(InvalidItemTypeError)
  })

  it('should throw InvalidItemTypeError for secret shorter than 8 characters', () => {
    expect(() =>
      Item.create({
        workspaceId: 'ws-1',
        type: 'secret',
        title: 'Key',
        content: 'short',
      }),
    ).toThrow(InvalidItemTypeError)
  })

  it('should throw InvalidItemTypeError for secret without content', () => {
    expect(() =>
      Item.create({ workspaceId: 'ws-1', type: 'secret', title: 'Key' }),
    ).toThrow(InvalidItemTypeError)
  })

  it('should default tagIds to an empty array', () => {
    const item = Item.create({ workspaceId: 'ws-1', type: 'text', title: 'Note' })

    expect(item.tagIds).toEqual([])
  })

  it('should create an item with provided tagIds', () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'text',
      title: 'Note',
      tagIds: ['tag-1', 'tag-2'],
    })

    expect(item.tagIds).toEqual(['tag-1', 'tag-2'])
  })

  it('should create an item with an optional folderId', () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'text',
      title: 'Note',
      folderId: 'folder-1',
    })

    expect(item.folderId).toBe('folder-1')
  })

  it('should have undefined folderId when not provided', () => {
    const item = Item.create({ workspaceId: 'ws-1', type: 'text', title: 'Note' })

    expect(item.folderId).toBeUndefined()
  })

  it('should create an item with a provided id', () => {
    const id = new UniqueEntityID('item-fixed-id')
    const item = Item.create(
      { workspaceId: 'ws-1', type: 'text', title: 'Note' },
      id,
    )

    expect(item.id.toString()).toBe('item-fixed-id')
  })

  it('should update title and touch updatedAt', () => {
    const item = Item.create({ workspaceId: 'ws-1', type: 'text', title: 'Old' })
    const beforeUpdate = item.updatedAt

    item.title = 'New'

    expect(item.title).toBe('New')
    expect(item.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime())
  })

  it('should update content and touch updatedAt', () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'document',
      title: 'Doc',
      content: 'old content',
    })
    const beforeUpdate = item.updatedAt

    item.content = 'new content'

    expect(item.content).toBe('new content')
    expect(item.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime())
  })

  it('should update tagIds and touch updatedAt', () => {
    const item = Item.create({ workspaceId: 'ws-1', type: 'text', title: 'Note' })
    const beforeUpdate = item.updatedAt

    item.tagIds = ['tag-1']

    expect(item.tagIds).toEqual(['tag-1'])
    expect(item.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime())
  })

  it('should create with default timestamps', () => {
    const before = new Date()
    const item = Item.create({ workspaceId: 'ws-1', type: 'text', title: 'Note' })
    const after = new Date()

    expect(item.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(item.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    expect(item.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(item.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })
})
