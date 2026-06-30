import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetTagsUseCase } from '../factories/make-get-tags-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const getTagsController: FastifyPluginCallbackZod = async (app) => {
  app.get(
    '/tags',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Get Tags',
        description: 'List all tags for a workspace',
        operationId: 'getTags',
        tags: ['Tags'],
        querystring: z.object({
          workspaceId: z.string(),
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(1000).optional(),
        }),
        response: {
          200: z.object({
            tags: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                slug: z.string(),
                color: z.enum(['blue', 'green', 'orange', 'purple', 'red', 'yellow']),
                workspaceId: z.string(),
                createdAt: z.string(),
              }),
            ),
            nextCursor: z.string().optional(),
          }),
          401: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { workspaceId, cursor, limit } = request.query

      const useCase = makeGetTagsUseCase()
      const result = await useCase.execute({ workspaceId, cursor, limit })

      if (result.isLeft()) {
        return reply.status(500).send({ message: 'Internal Server Error' })
      }

      const tags = result.value.tags.map((tag) => ({
        id: tag.id.toString(),
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
        workspaceId: tag.workspaceId,
        createdAt: tag.createdAt.toISOString(),
      }))

      return reply.status(200).send({ tags, nextCursor: result.value.nextCursor })
    },
  )
}
