import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeGetFoldersUseCase } from '../factories/make-get-folders-use-case.ts'

export const getFoldersByParentController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.get(
    '/folders',
    {
      schema: {
        summary: 'Get Folders',
        description:
          'List folders by parent. Omit parentId to get root folders.',
        operationId: 'getFoldersByParent',
        tags: ['Folders'],
        querystring: z.object({
          parentId: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { parentId } = request.query

      const useCase = makeGetFoldersUseCase()
      const result = await useCase.execute({ parentId })

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
