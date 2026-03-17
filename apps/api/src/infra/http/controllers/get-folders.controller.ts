import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetFoldersUseCase } from '../factories/make-get-folders-use-case.ts'
import { verifyJwt } from '../verify-jwt.ts'

export const getFoldersController: FastifyPluginCallbackZod = async (app) => {
  app.get(
    '/folders',
    {
      schema: {
        summary: 'Get Folders',
        description: 'List folders. Optionally filter by parentId or workspaceId.',
        operationId: 'getFolders',
        tags: ['Folders'],
        querystring: z.object({
          parentId: z.string().optional(),
          workspaceId: z.string().optional(),
        }),
        response: {
          200: z.object({
            folders: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                workspaceId: z.string(),
                parentId: z.string().nullable(),
                tagIds: z.array(z.string()),
                createdAt: z.date(),
                updatedAt: z.date(),
              }),
            ),
          }),
          401: z.object({ message: z.string() }),
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

      const { parentId, workspaceId } = request.query

      const useCase = makeGetFoldersUseCase()
      const result = await useCase.execute({ userId: payload.userId, parentId, workspaceId })

      if (result.isLeft()) {
        return reply.status(500).send({ message: 'Internal Server Error' })
      }

      return reply.status(200).send({
        folders: result.value.folders.map((folder) => ({
          id: folder.id.toString(),
          name: folder.name,
          workspaceId: folder.workspaceId,
          parentId: folder.parentId ?? null,
          tagIds: folder.tagIds,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
        })),
      })
    },
  )
}
