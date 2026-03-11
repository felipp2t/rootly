import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetItemsUseCase } from '../factories/make-get-items-use-case.ts'

export const getItemsController: FastifyPluginCallbackZod = async (app) => {
  app.get(
    '/items',
    {
      schema: {
        summary: 'Get Items',
        description: 'List items. Optionally filter by parentId.',
        operationId: 'getItems',
        tags: ['Items'],
        querystring: z.object({
          parentId: z.string().optional(),
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
                tagIds: z.array(z.string()),
                createdAt: z.date(),
                updatedAt: z.date(),
              }),
            ),
          }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { parentId } = request.query

      const useCase = makeGetItemsUseCase()
      const result = await useCase.execute({ parentId })

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
          tagIds: item.tagIds,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      })
    },
  )
}
