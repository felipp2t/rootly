import type { FastifyInstance } from 'fastify'
import { webSocketNotificationGateway } from '@/infra/realtime/websocket-notification-gateway.ts'
import { verifyJwt } from '../verify-jwt.ts'

export async function notificationsWebSocketController(app: FastifyInstance) {
  app.get('/ws/notifications', { websocket: true }, async (socket, request) => {
    const { ticket } = request.query as { ticket?: string }

    if (!ticket) {
      socket.close(1008, 'Missing ticket')
      return
    }

    const payload = await verifyJwt(ticket)

    if (!payload) {
      socket.close(1008, 'Invalid ticket')
      return
    }

    const { userId } = payload

    webSocketNotificationGateway.register(userId, socket)

    socket.on('close', () => {
      webSocketNotificationGateway.unregister(userId, socket)
    })
  })
}
