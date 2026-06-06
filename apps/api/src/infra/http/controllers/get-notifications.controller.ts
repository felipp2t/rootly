import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetNotificationsUseCase } from '../factories/make-get-notifications-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

const notificationMetadataSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('info') }),
  z.object({ type: z.literal('workspace_invite'), inviteId: z.string() }),
])

export const getNotificationsController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.get(
    '/notifications',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Get Notifications',
        description: 'List the authenticated user notifications',
        operationId: 'getNotifications',
        tags: ['Notifications'],
        response: {
          200: z.object({
            notifications: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                content: z.string(),
                metadata: notificationMetadataSchema,
                readAt: z.string().nullable(),
                createdAt: z.string(),
              }),
            ),
          }),
          401: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const useCase = makeGetNotificationsUseCase()
      const result = await useCase.execute({ recipientId: request.userId })

      if (result.isLeft()) {
        return reply.status(500).send({ message: 'Internal Server Error' })
      }

      const notifications = result.value.notifications.map((notification) => ({
        id: notification.id.toString(),
        title: notification.title,
        content: notification.content,
        metadata: notification.metadata,
        readAt: notification.readAt ? notification.readAt.toISOString() : null,
        createdAt: notification.createdAt.toISOString(),
      }))

      return reply.status(200).send({ notifications })
    },
  )
}
