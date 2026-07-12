import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetWorkspacesUseCase } from '../factories/make-get-workspaces-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const getWorkspacesController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.get(
    '/workspaces',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Get Workspaces',
        description: 'Get all workspaces for the authenticated user',
        operationId: 'getWorkspaces',
        tags: ['Workspaces'],
        response: {
          200: z.object({
            workspaces: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                userId: z.string(),
                itemCount: z.number(),
                memberCount: z.number(),
                createdAt: z.date(),
                updatedAt: z.date(),
              }),
            ),
          }),
          401: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const useCase = makeGetWorkspacesUseCase()
      const result = await useCase.execute({ userId: request.userId })

      if (result.isLeft()) {
        return reply.status(500).send({ message: 'Internal Server Error' })
      }

      const { workspaces } = result.value

      return reply.status(200).send({
        workspaces: workspaces.map((workspace) => ({
          id: workspace.id.toString(),
          name: workspace.name,
          userId: workspace.userId,
          itemCount: workspace.itemCount,
          memberCount: workspace.memberCount,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        })),
      })
    },
  )
}
