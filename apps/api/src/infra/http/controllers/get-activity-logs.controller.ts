import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetActivityLogsUseCase } from '../factories/make-get-activity-logs-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const getActivityLogsController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.get(
    '/workspaces/:workspaceId/activity',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Get Activity Logs',
        description:
          'List the activity log of a workspace, optionally filtered by resourceId or resourceType',
        operationId: 'getActivityLogs',
        tags: ['Activity'],
        params: z.object({
          workspaceId: z.string(),
        }),
        querystring: z.object({
          resourceId: z.string().optional(),
          resourceType: z
            .enum(['folder', 'item', 'member', 'workspace', 'role'])
            .optional(),
        }),
        response: {
          200: z.object({
            activityLogs: z.array(
              z.object({
                id: z.string(),
                workspaceId: z.string(),
                resourceType: z.enum([
                  'folder',
                  'item',
                  'member',
                  'workspace',
                  'role',
                ]),
                resourceId: z.string(),
                resourceName: z.string(),
                action: z.enum([
                  'folder_created',
                  'folder_renamed',
                  'folder_deleted',
                  'item_created',
                  'item_updated',
                  'item_archived',
                  'item_restored',
                  'item_deleted',
                  'member_invited',
                  'member_joined',
                  'member_role_changed',
                  'member_removed',
                  'workspace_renamed',
                  'role_created',
                  'role_deleted',
                  'role_permissions_changed',
                ]),
                actorUserId: z.string(),
                actorName: z.string(),
                metadata: z
                  .object({
                    before: z.record(z.string(), z.unknown()).optional(),
                    after: z.record(z.string(), z.unknown()).optional(),
                  })
                  .nullable(),
                createdAt: z.date(),
              }),
            ),
          }),
          401: z.object({ message: z.string() }),
          403: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { workspaceId } = request.params
      const { resourceId, resourceType } = request.query

      const useCase = makeGetActivityLogsUseCase()
      const result = await useCase.execute({
        userId: request.userId,
        workspaceId,
        resourceId,
        resourceType,
      })

      if (result.isLeft()) {
        const error = result.value
        switch (error.constructor.name) {
          case 'ResourceNotFoundError':
            return reply.status(404).send({ message: error.message })
          case 'NotAllowedError':
            return reply.status(403).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(200).send({
        activityLogs: result.value.activityLogs.map((log) => ({
          id: log.id.toString(),
          workspaceId: log.workspaceId,
          resourceType: log.resourceType,
          resourceId: log.resourceId,
          resourceName: log.resourceName,
          action: log.action,
          actorUserId: log.actorUserId,
          actorName: log.actorName,
          metadata: log.metadata ?? null,
          createdAt: log.createdAt,
        })),
      })
    },
  )
}
