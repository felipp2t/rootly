import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetWorkspaceUseCase } from '../factories/make-get-workspace-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const getWorkspaceController: FastifyPluginCallbackZod = async (app) => {
  app.get(
    '/workspaces/:workspaceId',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Get Workspace',
        description: 'Get a workspace by ID for the authenticated user',
        operationId: 'getWorkspace',
        tags: ['Workspaces'],
        params: z.object({
          workspaceId: z.string(),
        }),
        response: {
          200: z.object({
            workspace: z.object({
              id: z.string(),
              name: z.string(),
              userId: z.string(),
              createdAt: z.date(),
              updatedAt: z.date(),
            }),
          }),
          401: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { workspaceId } = request.params

      const useCase = makeGetWorkspaceUseCase()
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

      const { workspace } = result.value

      return reply.status(200).send({
        workspace: {
          id: workspace.id.toString(),
          name: workspace.name,
          userId: workspace.userId,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        },
      })
    },
  )
}
