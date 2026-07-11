import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetMyWorkspacePermissionsUseCase } from '../factories/make-get-my-workspace-permissions-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const getMyWorkspacePermissionsController: FastifyPluginCallbackZod =
  async (app) => {
    app.get(
      '/workspaces/:workspaceId/me/permissions',
      {
        onRequest: verifyJwtHook,
        schema: {
          summary: 'Get My Workspace Permissions',
          description: 'Get the authenticated user permissions in a workspace',
          operationId: 'getMyWorkspacePermissions',
          tags: ['Me'],
          params: z.object({
            workspaceId: z.string(),
          }),
          response: {
            200: z.object({
              permissions: z.array(
                z.object({
                  resource: z.enum([
                    'workspace',
                    'folder',
                    'item',
                    'member',
                    'role',
                  ]),
                  action: z.enum([
                    'create',
                    'read',
                    'update',
                    'delete',
                    'invite',
                    'all',
                  ]),
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
        const { workspaceId } = request.params

        const useCase = makeGetMyWorkspacePermissionsUseCase()
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

        return reply.status(200).send(result.value)
      },
    )
  }
