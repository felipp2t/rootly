import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import { Notification } from './notification.ts'

const recipientId = new UniqueEntityID('user-1')

describe('Notification', () => {
  it('should create a notification with default createdAt and no readAt', () => {
    const before = new Date()
    const notification = Notification.create({
      recipientId,
      title: 'Hello',
      content: 'You have a new message',
      metadata: { type: 'info' },
    })
    const after = new Date()

    expect(notification.title).toBe('Hello')
    expect(notification.content).toBe('You have a new message')
    expect(notification.type).toBe('info')
    expect(notification.metadata).toEqual({ type: 'info' })
    expect(notification.recipientId).toBe(recipientId)
    expect(notification.readAt).toBeUndefined()
    expect(notification.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(notification.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should create a notification with explicit createdAt', () => {
    const createdAt = new Date('2024-01-01')
    const notification = Notification.create({
      recipientId,
      title: 'Test',
      content: 'Body',
      metadata: { type: 'info' },
      createdAt,
    })

    expect(notification.createdAt).toEqual(createdAt)
  })

  it('should create a workspace_invite notification with inviteId in metadata', () => {
    const notification = Notification.create({
      recipientId,
      title: 'Invite',
      content: 'You have been invited',
      metadata: { type: 'workspace_invite', inviteId: 'invite-123' },
    })

    expect(notification.type).toBe('workspace_invite')
    expect(notification.metadata).toEqual({
      type: 'workspace_invite',
      inviteId: 'invite-123',
    })
  })

  it('should create a notification with a provided id', () => {
    const id = new UniqueEntityID('notif-fixed-id')
    const notification = Notification.create(
      {
        recipientId,
        title: 'Fixed',
        content: 'Body',
        metadata: { type: 'info' },
      },
      id,
    )

    expect(notification.id.toString()).toBe('notif-fixed-id')
  })

  it('should create a notification with readAt already set', () => {
    const readAt = new Date('2024-06-01')
    const notification = Notification.create({
      recipientId,
      title: 'Already read',
      content: 'Body',
      metadata: { type: 'info' },
      readAt,
    })

    expect(notification.readAt).toEqual(readAt)
  })

  it('should mark a notification as read by calling read()', () => {
    const notification = Notification.create({
      recipientId,
      title: 'Unread',
      content: 'Body',
      metadata: { type: 'info' },
    })

    expect(notification.readAt).toBeUndefined()

    const before = new Date()
    notification.read()
    const after = new Date()

    expect(notification.readAt).toBeDefined()
    expect(notification.readAt!.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(notification.readAt!.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should allow read() to be called multiple times without error', () => {
    const notification = Notification.create({
      recipientId,
      title: 'Double read',
      content: 'Body',
      metadata: { type: 'info' },
    })

    notification.read()
    const firstReadAt = notification.readAt

    notification.read()

    expect(notification.readAt).toBeDefined()
    expect(notification.readAt!.getTime()).toBeGreaterThanOrEqual(firstReadAt!.getTime())
  })
})
