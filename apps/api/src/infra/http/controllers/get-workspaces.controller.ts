import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetWorkspacesUseCase } from '../factories/make-get-workspaces-use-case.ts'
import { verifyJwt } from '../verify-jwt.ts'

export const getWorkspacesController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.get(
    '/workspaces',
    {
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
      const token = request.cookies.accessToken

      if (!token) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const payload = await verifyJwt(token)

      if (!payload) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const useCase = makeGetWorkspacesUseCase()
      const result = await useCase.execute({ userId: payload.userId })

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
