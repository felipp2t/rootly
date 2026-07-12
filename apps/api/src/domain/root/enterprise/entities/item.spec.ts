import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { ItemArchivedEvent } from '../events/item-archived-event.ts'
import { ItemCreatedEvent } from '../events/item-created-event.ts'
import { ItemDeletedEvent } from '../events/item-deleted-event.ts'
import { ItemRestoredEvent } from '../events/item-restored-event.ts'
import { ItemUpdatedEvent } from '../events/item-updated-event.ts'
import { InvalidItemTypeError } from '../validators/_errors/invalid-item-type.ts'
import { ItemArchivedError } from '../validators/_errors/item-archived-error.ts'
import { Item } from './item.ts'

describe('Item', () => {
  it('should create a text item without content', () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'text',
      title: 'Note',
    })

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
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'text',
      title: 'Note',
    })

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
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'text',
      title: 'Old',
    })
    const beforeUpdate = item.updatedAt

    item.title = 'New'

    expect(item.title).toBe('New')
    expect(item.updatedAt.getTime()).toBeGreaterThanOrEqual(
      beforeUpdate.getTime(),
    )
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
    expect(item.updatedAt.getTime()).toBeGreaterThanOrEqual(
      beforeUpdate.getTime(),
    )
  })

  it('should create with default timestamps', () => {
    const before = new Date()
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'text',
      title: 'Note',
    })
    const after = new Date()

    expect(item.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(item.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    expect(item.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(item.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should not be archived by default', () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'text',
      title: 'Note',
    })

    expect(item.isArchived).toBe(false)
    expect(item.archivedAt).toBeUndefined()
  })

  it('should archive an item and touch updatedAt', () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'text',
      title: 'Note',
    })
    const beforeArchive = item.updatedAt

    item.archive()

    expect(item.isArchived).toBe(true)
    expect(item.archivedAt).toBeInstanceOf(Date)
    expect(item.updatedAt.getTime()).toBeGreaterThanOrEqual(
      beforeArchive.getTime(),
    )
  })

  it('should restore an archived item', () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'text',
      title: 'Note',
    })

    item.archive()
    item.restore()

    expect(item.isArchived).toBe(false)
    expect(item.archivedAt).toBeUndefined()
  })

  it('should throw ItemArchivedError when setting title on an archived item', () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'text',
      title: 'Note',
    })

    item.archive()

    expect(() => {
      item.title = 'New title'
    }).toThrow(ItemArchivedError)
  })

  it('should throw ItemArchivedError when setting content on an archived item', () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'text',
      title: 'Note',
    })

    item.archive()

    expect(() => {
      item.content = 'New content'
    }).toThrow(ItemArchivedError)
  })

  it('should allow editing again after restoring an archived item', () => {
    const item = Item.create({
      workspaceId: 'ws-1',
      type: 'text',
      title: 'Note',
    })

    item.archive()
    item.restore()
    item.title = 'New title'

    expect(item.title).toBe('New title')
  })

  it('should register an ItemCreatedEvent with the provided actorId', () => {
    const item = Item.create(
      { workspaceId: 'ws-1', type: 'text', title: 'Note' },
      undefined,
      'user-1',
    )

    expect(item.domainEvents).toHaveLength(1)
    const event = item.domainEvents[0] as ItemCreatedEvent
    expect(event).toBeInstanceOf(ItemCreatedEvent)
    expect(event.actorId).toBe('user-1')
  })

  it('should not register a domain event when rehydrated with an id', () => {
    const id = new UniqueEntityID('item-1')
    const item = Item.create(
      { workspaceId: 'ws-1', type: 'text', title: 'Note' },
      id,
    )

    expect(item.domainEvents).toHaveLength(0)
  })

  it('should register an ItemArchivedEvent with actorId on archive', () => {
    const item = Item.create(
      { workspaceId: 'ws-1', type: 'text', title: 'Note' },
      new UniqueEntityID('item-1'),
    )

    item.archive('user-1')

    expect(item.domainEvents).toHaveLength(1)
    const event = item.domainEvents[0] as ItemArchivedEvent
    expect(event).toBeInstanceOf(ItemArchivedEvent)
    expect(event.actorId).toBe('user-1')
  })

  it('should register an ItemRestoredEvent with actorId on restore', () => {
    const item = Item.create(
      { workspaceId: 'ws-1', type: 'text', title: 'Note' },
      new UniqueEntityID('item-1'),
    )
    item.archive()
    item.clearEvents()

    item.restore('user-1')

    expect(item.domainEvents).toHaveLength(1)
    const event = item.domainEvents[0] as ItemRestoredEvent
    expect(event).toBeInstanceOf(ItemRestoredEvent)
    expect(event.actorId).toBe('user-1')
  })

  it('should register an ItemDeletedEvent with actorId on delete', () => {
    const item = Item.create(
      { workspaceId: 'ws-1', type: 'text', title: 'Note' },
      new UniqueEntityID('item-1'),
    )

    item.delete('user-1')

    expect(item.domainEvents).toHaveLength(1)
    const event = item.domainEvents[0] as ItemDeletedEvent
    expect(event).toBeInstanceOf(ItemDeletedEvent)
    expect(event.actorId).toBe('user-1')
  })

  it('should register an ItemUpdatedEvent with before/after and actorId when title changes', () => {
    const item = Item.create(
      { workspaceId: 'ws-1', type: 'text', title: 'Old Title' },
      new UniqueEntityID('item-1'),
    )

    item.update({ title: 'New Title' }, 'user-1')

    expect(item.domainEvents).toHaveLength(1)
    const event = item.domainEvents[0] as ItemUpdatedEvent
    expect(event).toBeInstanceOf(ItemUpdatedEvent)
    expect(event.changes).toEqual({
      before: { title: 'Old Title' },
      after: { title: 'New Title' },
    })
    expect(event.actorId).toBe('user-1')
  })

  it('should not register an ItemUpdatedEvent when no fields change', () => {
    const item = Item.create(
      { workspaceId: 'ws-1', type: 'text', title: 'Same Title' },
      new UniqueEntityID('item-1'),
    )

    item.update({ title: 'Same Title' }, 'user-1')

    expect(item.domainEvents).toHaveLength(0)
  })
})
