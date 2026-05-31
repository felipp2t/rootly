import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeDeleteRoleUseCase } from '../factories/make-delete-role-use-case.ts'
import { verifyJwt } from '../verify-jwt.ts'

export const deleteRoleController: FastifyPluginCallbackZod = async (app) => {
  app.delete(
    '/workspaces/:workspaceId/roles/:roleId',
    {
      schema: {
        summary: 'Delete Role',
        description: 'Delete a role from a workspace',
        operationId: 'deleteRole',
        tags: ['Roles'],
        params: z.object({
          workspaceId: z.string(),
          roleId: z.string(),
        }),
        response: {
          204: z.undefined(),
          401: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          409: z.object({ message: z.string() }),
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

      const { workspaceId, roleId } = request.params

      const useCase = makeDeleteRoleUseCase()
      const result = await useCase.execute({ userId: payload.userId, workspaceId, roleId })

      if (result.isLeft()) {
        const error = result.value
        switch (error.constructor.name) {
          case 'ResourceNotFoundError':
            return reply.status(404).send({ message: error.message })
          case 'RoleInUseError':
            return reply.status(409).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(204).send()
    },
  )
}
