import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetWorkspaceInvitesUseCase } from '../factories/make-get-workspace-invites-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const getWorkspaceInvitesController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.get(
    '/workspaces/:workspaceId/invites',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Get Workspace Invites',
        description: 'List pending invites of a workspace',
        operationId: 'getWorkspaceInvites',
        tags: ['Invites'],
        params: z.object({
          workspaceId: z.string(),
        }),
        response: {
          200: z.object({
            invites: z.array(
              z.object({
                id: z.string(),
                email: z.string(),
                name: z.string(),
                roleId: z.string(),
                roleName: z.string(),
                status: z.string(),
                createdAt: z.string(),
                expiresAt: z.string(),
              }),
            ),
          }),
          401: z.object({ message: z.string() }),
          403: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { workspaceId } = request.params

      const useCase = makeGetWorkspaceInvitesUseCase()
      const result = await useCase.execute({
        userId: request.userId,
        workspaceId,
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

      const invites = result.value.invites.map((invite) => ({
        ...invite,
        createdAt: invite.createdAt.toISOString(),
        expiresAt: invite.expiresAt.toISOString(),
      }))

      return reply.status(200).send({ invites })
    },
  )
}
