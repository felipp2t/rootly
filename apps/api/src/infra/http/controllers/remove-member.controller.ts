import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeRemoveMemberUseCase } from '../factories/make-remove-member-use-case.ts'
import { verifyJwt } from '../verify-jwt.ts'

export const removeMemberController: FastifyPluginCallbackZod = async (app) => {
  app.delete(
    '/workspaces/:workspaceId/members/:memberId',
    {
      schema: {
        summary: 'Remove Member',
        description: 'Remove a member from a workspace',
        operationId: 'removeMember',
        tags: ['Members'],
        params: z.object({
          workspaceId: z.string(),
          memberId: z.string(),
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
      const token = request.cookies.accessToken

      if (!token) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const payload = await verifyJwt(token)

      if (!payload) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const { workspaceId, memberId } = request.params

      const useCase = makeRemoveMemberUseCase()
      const result = await useCase.execute({
        userId: payload.userId,
        workspaceId,
        memberId,
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
