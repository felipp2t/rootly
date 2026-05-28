import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetRolePermissionsUseCase } from '../factories/make-get-role-permissions-use-case.ts'
import { verifyJwt } from '../verify-jwt.ts'

export const getRolePermissionsController: FastifyPluginCallbackZod = async (app) => {
  app.get(
    '/workspaces/:workspaceId/roles/:roleId/permissions',
    {
      schema: {
        summary: 'Get Role Permissions',
        description: 'List all permissions for a role',
        operationId: 'getRolePermissions',
        tags: ['Roles'],
        params: z.object({
          workspaceId: z.string(),
          roleId: z.string(),
        }),
        response: {
          200: z.object({
            permissions: z.array(
              z.object({
                id: z.string(),
                roleId: z.string(),
                resource: z.enum(['workspace', 'folder', 'item', 'tag', 'member', 'role']),
                action: z.enum(['read', 'create', 'update', 'delete', 'invite', 'all']),
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

      const { workspaceId, roleId } = request.params

      const useCase = makeGetRolePermissionsUseCase()
      const result = await useCase.execute({ userId: payload.userId, workspaceId, roleId })

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
        permissions: result.value.permissions.map((p) => ({
          id: p.id.toString(),
          roleId: p.roleId,
          resource: p.resource,
          action: p.action,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
      })
    },
  )
}
