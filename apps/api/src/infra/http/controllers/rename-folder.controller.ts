import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeRenameFolderUseCase } from '../factories/make-rename-folder-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const renameFolderController: FastifyPluginCallbackZod = async (app) => {
  app.patch(
    '/folders/:folderId',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Rename Folder',
        description: 'Rename a folder.',
        operationId: 'renameFolder',
        tags: ['Folders'],
        params: z.object({
          folderId: z.string(),
        }),
        body: z.object({
          name: z.string(),
        }),
        response: {
          204: z.undefined(),
          400: z.object({ message: z.string() }),
          401: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          409: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { folderId } = request.params
      const { name } = request.body

      const useCase = makeRenameFolderUseCase()
      const result = await useCase.execute({
        folderId,
        name,
        actorId: request.userId,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'FolderNotFoundError':
            return reply.status(404).send({ message: error.message })
          case 'FolderAlreadyExistsError':
            return reply.status(409).send({ message: error.message })
          case 'InvalidFolderNameError':
            return reply.status(400).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(204).send()
    },
  )
}
