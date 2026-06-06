import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { JwtEncrypter } from '@/infra/auth/jwt-encrypter.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const createWsTicketController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.post(
    '/ws-ticket',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Create WebSocket Ticket',
        description:
          'Issue a short-lived ticket used to authenticate a WebSocket connection',
        operationId: 'createWsTicket',
        tags: ['Notifications'],
        response: {
          201: z.object({ ticket: z.string() }),
          401: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const encrypter = new JwtEncrypter()
      const ticket = await encrypter.encrypt(
        { sub: request.userId, scope: 'ws' },
        '30s',
      )

      return reply.status(201).send({ ticket })
    },
  )
}
