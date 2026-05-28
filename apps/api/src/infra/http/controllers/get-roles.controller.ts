import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetRolesUseCase } from '../factories/make-get-roles-use-case.ts'
import { verifyJwt } from '../verify-jwt.ts'

export const getRolesController: FastifyPluginCallbackZod = async (app) => {
  app.get(
    '/workspaces/:workspaceId/roles',
    {
      schema: {
        summary: 'Get Roles',
        description: 'List all roles for a workspace',
        operationId: 'getRoles',
        tags: ['Roles'],
        params: z.object({
          workspaceId: z.string(),
        }),
        response: {
          200: z.object({
            roles: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                workspaceId: z.string(),
                createdAt: z.date(),
                updatedAt: z.date(),
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
      const token = request.cookies.accessToken

      if (!token) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const payload = await verifyJwt(token)

      if (!payload) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const { workspaceId } = request.params

      const useCase = makeGetRolesUseCase()
      const result = await useCase.execute({ userId: payload.userId, workspaceId })

      if (result.isLeft()) {
        const error = result.value
        switch (error.constructor.name) {
          case 'ResourceNotFoundError':
            return reply.status(404).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(200).send({
        roles: result.value.roles.map((role) => ({
          id: role.id.toString(),
          name: role.name,
          workspaceId: role.workspaceId,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        })),
      })
    },
  )
}
