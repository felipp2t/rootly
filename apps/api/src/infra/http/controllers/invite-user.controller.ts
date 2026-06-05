import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeInviteUserUseCase } from '../factories/make-invite-user-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const inviteUserController: FastifyPluginCallbackZod = async (app) => {
  app.post(
    '/workspaces/:workspaceId/invites',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Invite User',
        description: 'Invite a user to a workspace by email',
        operationId: 'inviteUser',
        tags: ['Members'],
        params: z.object({
          workspaceId: z.string(),
        }),
        body: z.object({
          email: z.string().email(),
          roleId: z.string(),
        }),
        response: {
          201: z.object({ workspaceInviteId: z.string() }),
          401: z.object({ message: z.string() }),
          403: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { workspaceId } = request.params
      const { email, roleId } = request.body

      const useCase = makeInviteUserUseCase()
      const result = await useCase.execute({
        email,
        inviterId: request.userId,
        workspaceId,
        roleId,
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

      return reply.status(201).send(result.value)
    },
  )
}
