import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetItemsUseCase } from '../factories/make-get-items-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const getItemsController: FastifyPluginCallbackZod = async (app) => {
  app.get(
    '/items',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Get Items',
        description:
          'List items. Optionally filter by parentId or workspaceId.',
        operationId: 'getItems',
        tags: ['Items'],
        querystring: z.object({
          parentId: z.string().optional(),
          workspaceId: z.string().optional(),
          includeArchived: z
            .stringbool({ truthy: ['true', 'yes'], falsy: ['false', 'no'] })
            .optional(),
          page: z.coerce.number().int().min(1).optional(),
          limit: z.coerce.number().int().min(1).optional(),
        }),
        response: {
          200: z.object({
            items: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                type: z.enum(['link', 'document', 'text', 'secret']),
                content: z.string().nullable(),
                workspaceId: z.string(),
                folderId: z.string().nullable(),
                archivedAt: z.date().nullable(),
                createdAt: z.date(),
                updatedAt: z.date(),
              }),
            ),
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPages: z.number(),
          }),
          401: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { parentId, workspaceId, includeArchived, page, limit } =
        request.query

      const useCase = makeGetItemsUseCase()
      const result = await useCase.execute({
        userId: request.userId,
        parentId,
        workspaceId,
        includeArchived,
        page,
        limit,
      })

      if (result.isLeft()) {
        return reply.status(500).send({ message: 'Internal Server Error' })
      }

      return reply.status(200).send({
        items: result.value.items.map((item) => ({
          id: item.id.toString(),
          title: item.title,
          type: item.type,
          content: item.content ?? null,
          workspaceId: item.workspaceId,
          folderId: item.folderId ?? null,
          archivedAt: item.archivedAt ?? null,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        page: result.value.page,
        limit: result.value.limit,
        total: result.value.total,
        totalPages: result.value.totalPages,
      })
    },
  )
}
