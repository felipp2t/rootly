import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeCreateWorkspaceUseCase } from '../factories/make-create-workspace-use-case.ts'

export const createWorkspaceController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.post(
    '/workspaces',
    {
      schema: {
        summary: 'Create Workspace',
        description: 'Create a new workspace',
        operationId: 'createWorkspace',
        tags: ['Workspaces'],
        body: z.object({
          name: z.string(),
          userId: z.string(),
        }),
        response: {
          201: z.object({ workspaceId: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { name, userId } = request.body

      const useCase = makeCreateWorkspaceUseCase()
      const result = await useCase.execute({ name, userId })

      if (result.isLeft()) {
        return reply.status(500).send({ message: 'Internal Server Error' })
      }

      return reply.status(201).send({ workspaceId: result.value.workspaceId })
    },
  )
}
