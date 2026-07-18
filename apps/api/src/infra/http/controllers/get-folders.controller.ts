import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetFoldersUseCase } from '../factories/make-get-folders-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const getFoldersController: FastifyPluginCallbackZod = async (app) => {
  app.get(
    '/folders',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Get Folders',
        description:
          'List folders. Optionally filter by parentId or workspaceId.',
        operationId: 'getFolders',
        tags: ['Folders'],
        querystring: z.object({
          parentId: z.string().optional(),
          workspaceId: z.string().optional(),
          page: z.coerce.number().int().min(1).optional(),
          limit: z.coerce.number().int().min(1).optional(),
        }),
        response: {
          200: z.object({
            folders: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                workspaceId: z.string(),
                parentId: z.string().nullable(),
                itemCount: z.number(),
                subfolderCount: z.number(),
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
      const { parentId, workspaceId, page, limit } = request.query

      const useCase = makeGetFoldersUseCase()
      const result = await useCase.execute({
        userId: request.userId,
        parentId,
        workspaceId,
        page,
        limit,
      })

      if (result.isLeft()) {
        return reply.status(500).send({ message: 'Internal Server Error' })
      }

      return reply.status(200).send({
        folders: result.value.items.map(
          ({ folder, itemCount, subfolderCount }) => ({
            id: folder.id.toString(),
            name: folder.name,
            workspaceId: folder.workspaceId,
            parentId: folder.parentId ?? null,
            itemCount,
            subfolderCount,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
          }),
        ),
        page: result.value.page,
        limit: result.value.limit,
        total: result.value.total,
        totalPages: result.value.totalPages,
      })
    },
  )
}
