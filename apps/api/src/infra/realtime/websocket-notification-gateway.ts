import type { WebSocket } from '@fastify/websocket'
import type { NotificationGateway } from '@/domain/notification/application/gateways/notification-gateway.ts'
import type { Notification } from '@/domain/notification/enterprise/entities/notification.ts'

function serialize(notification: Notification) {
  return {
    id: notification.id.toString(),
    title: notification.title,
    content: notification.content,
    metadata: notification.metadata,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString(),
  }
}

// In-memory registry of live connections keyed by user id.
// NOTE: single-instance only. Horizontal scaling would require a shared
// pub/sub layer (e.g. Redis) to fan out across processes.
class WebSocketNotificationGateway implements NotificationGateway {
  private readonly connections = new Map<string, Set<WebSocket>>()

  register(userId: string, socket: WebSocket): void {
    const sockets = this.connections.get(userId) ?? new Set<WebSocket>()
    sockets.add(socket)
    this.connections.set(userId, sockets)
  }

  unregister(userId: string, socket: WebSocket): void {
    const sockets = this.connections.get(userId)
    if (!sockets) return

    sockets.delete(socket)
    if (sockets.size === 0) {
      this.connections.delete(userId)
    }
  }

  send(recipientId: string, notification: Notification): void {
    const sockets = this.connections.get(recipientId)
    if (!sockets || sockets.size === 0) return

    const payload = JSON.stringify({
      type: 'notification',
      notification: serialize(notification),
    })

    for (const socket of sockets) {
      try {
        socket.send(payload)
      } catch {
        // best-effort: a dead socket must never break notification flow
      }
    }
  }
}

export const webSocketNotificationGateway = new WebSocketNotificationGateway()
