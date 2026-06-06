import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeDeclineInviteUseCase } from '../factories/make-decline-invite-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const declineInviteController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.post(
    '/invites/:inviteId/decline',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Decline Invite',
        description: 'Decline a workspace invite',
        operationId: 'declineInvite',
        tags: ['Invites'],
        params: z.object({
          inviteId: z.string(),
        }),
        response: {
          204: z.undefined(),
          401: z.object({ message: z.string() }),
          403: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          409: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { inviteId } = request.params

      const useCase = makeDeclineInviteUseCase()
      const result = await useCase.execute({
        inviteId,
        userId: request.userId,
      })

      if (result.isLeft()) {
        const error = result.value
        switch (error.constructor.name) {
          case 'ResourceNotFoundError':
            return reply.status(404).send({ message: error.message })
          case 'NotAllowedError':
            return reply.status(403).send({ message: error.message })
          case 'WorkspaceInviteAlreadyAcceptedError':
          case 'WorkspaceInviteExpiredError':
            return reply.status(409).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(204).send()
    },
  )
}
