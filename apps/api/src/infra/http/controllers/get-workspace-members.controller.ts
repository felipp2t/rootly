import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetWorkspaceMembersUseCase } from '../factories/make-get-workspace-members-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const getWorkspaceMembersController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.get(
    '/workspaces/:workspaceId/members',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Get Workspace Members',
        description: 'List all members of a workspace with their user and role',
        operationId: 'getWorkspaceMembers',
        tags: ['Members'],
        params: z.object({
          workspaceId: z.string(),
        }),
        response: {
          200: z.object({
            members: z.array(
              z.object({
                id: z.string(),
                userId: z.string(),
                name: z.string(),
                email: z.string(),
                roleId: z.string(),
                roleName: z.string(),
              }),
            ),
          }),
          401: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { workspaceId } = request.params

      const useCase = makeGetWorkspaceMembersUseCase()
      const result = await useCase.execute({
        userId: request.userId,
        workspaceId,
      })

      if (result.isLeft()) {
        const error = result.value
        switch (error.constructor.name) {
          case 'ResourceNotFoundError':
            return reply.status(404).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(200).send({ members: result.value.members })
    },
  )
}
