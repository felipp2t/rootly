import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeUpdateWorkspaceUseCase } from '../factories/make-update-workspace-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const updateWorkspaceController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.patch(
    '/workspaces/:workspaceId',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Update Workspace',
        description: "Update a workspace's name.",
        operationId: 'updateWorkspace',
        tags: ['Workspaces'],
        params: z.object({
          workspaceId: z.string(),
        }),
        body: z.object({
          name: z.string().min(3),
        }),
        response: {
          204: z.undefined(),
          401: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { workspaceId } = request.params
      const { name } = request.body

      const useCase = makeUpdateWorkspaceUseCase()
      const result = await useCase.execute({
        userId: request.userId,
        workspaceId,
        name,
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

      return reply.status(204).send()
    },
  )
}
