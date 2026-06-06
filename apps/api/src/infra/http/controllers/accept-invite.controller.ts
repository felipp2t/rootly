import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeAcceptInviteUseCase } from '../factories/make-accept-invite-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const acceptInviteController: FastifyPluginCallbackZod = async (app) => {
  app.post(
    '/invites/:inviteId/accept',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Accept Invite',
        description: 'Accept a workspace invite',
        operationId: 'acceptInvite',
        tags: ['Invites'],
        params: z.object({
          inviteId: z.string(),
        }),
        response: {
          200: z.object({ workspaceId: z.string() }),
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

      const useCase = makeAcceptInviteUseCase()
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

      return reply.status(200).send(result.value)
    },
  )
}
