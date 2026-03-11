import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeAssignTagToFolderUseCase } from '../factories/make-assign-tag-to-folder-use-case.ts'

export const assignTagToFolderController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.patch(
    '/folders/:folderId/tags/:tagId',
    {
      schema: {
        summary: 'Assign Tag to Folder',
        description: 'Assign an existing tag to a folder',
        operationId: 'assignTagToFolder',
        tags: ['Folders', 'Tags'],
        params: z.object({
          folderId: z.string(),
          tagId: z.string(),
        }),
        response: {
          204: z.void(),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { folderId, tagId } = request.params

      const useCase = makeAssignTagToFolderUseCase()
      const result = await useCase.execute({ folderId, tagId })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'FolderNotFoundError':
          case 'TagNotFoundError':
            return reply.status(404).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(204).send()
    },
  )
}
