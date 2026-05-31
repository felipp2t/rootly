import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeSetRolePermissionsUseCase } from '../factories/make-set-role-permissions-use-case.ts'
import { verifyJwt } from '../verify-jwt.ts'

const permissionResourceSchema = z.enum(['workspace', 'folder', 'item', 'tag', 'member', 'role'])
const permissionActionSchema = z.enum(['read', 'create', 'update', 'delete', 'invite', 'all'])

export const setRolePermissionsController: FastifyPluginCallbackZod = async (app) => {
  app.put(
    '/workspaces/:workspaceId/roles/:roleId/permissions',
    {
      schema: {
        summary: 'Set Role Permissions',
        description: 'Replace all permissions for a role',
        operationId: 'setRolePermissions',
        tags: ['Roles'],
        params: z.object({
          workspaceId: z.string(),
          roleId: z.string(),
        }),
        body: z.object({
          permissions: z.array(
            z.object({
              resource: permissionResourceSchema,
              action: permissionActionSchema,
            }),
          ),
        }),
        response: {
          204: z.undefined(),
          400: z.object({ message: z.string() }),
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
      const { permissions } = request.body

      const useCase = makeSetRolePermissionsUseCase()
      const result = await useCase.execute({
        userId: payload.userId,
        workspaceId,
        roleId,
        permissions,
      })

      if (result.isLeft()) {
        const error = result.value
        switch (error.constructor.name) {
          case 'ResourceNotFoundError':
            return reply.status(404).send({ message: error.message })
          case 'InvalidPermissionError':
            return reply.status(400).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(204).send()
    },
  )
}
