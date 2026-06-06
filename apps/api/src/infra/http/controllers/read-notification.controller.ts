import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeReadNotificationUseCase } from '../factories/make-read-notification-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const readNotificationController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.patch(
    '/notifications/:notificationId/read',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Read Notification',
        description: 'Mark a notification as read',
        operationId: 'readNotification',
        tags: ['Notifications'],
        params: z.object({
          notificationId: z.string(),
        }),
        response: {
          204: z.undefined(),
          401: z.object({ message: z.string() }),
          403: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { notificationId } = request.params

      const useCase = makeReadNotificationUseCase()
      const result = await useCase.execute({
        recipientId: request.userId,
        notificationId,
      })

      if (result.isLeft()) {
        const error = result.value
        switch (error.constructor.name) {
          case 'ResourceNotFoundError':
            return reply.status(404).send({ message: error.message })
          case 'NotAllowedError':
            return reply.status(403).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(204).send()
    },
  )
}
