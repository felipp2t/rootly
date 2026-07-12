import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeDeleteFolderUseCase } from '../factories/make-delete-folder-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const deleteFolderController: FastifyPluginCallbackZod = async (app) => {
  app.delete(
    '/folders/:folderId',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Delete Folder',
        description: 'Permanently delete an empty folder',
        operationId: 'deleteFolder',
        tags: ['Folders'],
        params: z.object({
          folderId: z.string(),
        }),
        response: {
          204: z.undefined(),
          401: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          409: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { folderId } = request.params

      const useCase = makeDeleteFolderUseCase()
      const result = await useCase.execute({ folderId })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'FolderNotFoundError':
            return reply.status(404).send({ message: error.message })
          case 'FolderNotEmptyError':
            return reply.status(409).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(204).send()
    },
  )
}
