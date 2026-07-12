import { FakeNotificationGateway } from '@test/gateways/fake-notification-gateway.ts'
import { InMemoryNotificationRepository } from '@test/repositories/in-memory-notification-repository.ts'
import { SendNotificationUseCase } from './send-notification.ts'

let inMemoryNotificationsRepository: InMemoryNotificationRepository
let fakeNotificationGateway: FakeNotificationGateway
let sut: SendNotificationUseCase

describe('Send Notification', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemoryNotificationRepository()
    fakeNotificationGateway = new FakeNotificationGateway()
    sut = new SendNotificationUseCase(
      inMemoryNotificationsRepository,
      fakeNotificationGateway,
    )
  })

  it('should be able to send a notification', async () => {
    const result = await sut.execute({
      recipientId: '1',
      title: 'Nova notificação',
      content: 'Conteúdo da notificação',
      metadata: { type: 'info' },
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryNotificationsRepository.items[0]).toEqual(
      result.value?.notification,
    )
  })

  it('should push the notification through the gateway', async () => {
    await sut.execute({
      recipientId: '1',
      title: 'Nova notificação',
      content: 'Conteúdo da notificação',
      metadata: { type: 'info' },
    })

    expect(fakeNotificationGateway.sent).toHaveLength(1)
    expect(fakeNotificationGateway.sent[0].recipientId).toBe('1')
  })

  it('should be able to send a workspace_invite notification', async () => {
    const result = await sut.execute({
      recipientId: '1',
      title: 'Você foi convidado',
      content: 'Você recebeu um convite para um workspace',
      metadata: { type: 'workspace_invite', inviteId: 'invite-1' },
    })

    expect(result.isRight()).toBe(true)
    expect(result.value?.notification.metadata).toEqual({
      type: 'workspace_invite',
      inviteId: 'invite-1',
    })
    expect(inMemoryNotificationsRepository.items[0]).toEqual(
      result.value?.notification,
    )
  })
})
