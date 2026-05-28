import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeCreateRoleUseCase } from '../factories/make-create-role-use-case.ts'
import { verifyJwt } from '../verify-jwt.ts'

export const createRoleController: FastifyPluginCallbackZod = async (app) => {
  app.post(
    '/workspaces/:workspaceId/roles',
    {
      schema: {
        summary: 'Create Role',
        description: 'Create a new role in a workspace',
        operationId: 'createRole',
        tags: ['Roles'],
        params: z.object({
          workspaceId: z.string(),
        }),
        body: z.object({
          name: z.string().min(1),
        }),
        response: {
          201: z.object({ roleId: z.string() }),
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

      const { workspaceId } = request.params
      const { name } = request.body

      const useCase = makeCreateRoleUseCase()
      const result = await useCase.execute({ userId: payload.userId, workspaceId, name })

      if (result.isLeft()) {
        const error = result.value
        switch (error.constructor.name) {
          case 'ResourceNotFoundError':
            return reply.status(404).send({ message: error.message })
          case 'RoleAlreadyExistsError':
            return reply.status(409).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(201).send({ roleId: result.value.roleId })
    },
  )
}
