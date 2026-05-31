import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeResolveFolderPathUseCase } from '../factories/make-resolve-folder-path-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const resolveFolderPathController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.get(
    '/folders/resolve-path',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Resolve Folder Path',
        description:
          'Resolve a folder path (list of ids separated by /) into the ordered chain of folder names. Validates that every id belongs to the workspace and that each folder is a child of the previous.',
        operationId: 'resolveFolderPath',
        tags: ['Folders'],
        querystring: z.object({
          workspaceId: z.string(),
          path: z.string().optional(),
        }),
        response: {
          200: z.object({
            path: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
              }),
            ),
          }),
          401: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { workspaceId, path } = request.query

      const pathIds = (path ?? '').split('/').filter(Boolean)

      const useCase = makeResolveFolderPathUseCase()
      const result = await useCase.execute({
        userId: request.userId,
        workspaceId,
        pathIds,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'ResourceNotFoundError':
          case 'InvalidFolderPathError':
            return reply.status(404).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(200).send({ path: result.value.path })
    },
  )
}
