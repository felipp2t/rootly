import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeResolveFolderPathUseCase } from '../factories/make-resolve-folder-path-use-case.ts'
import { verifyJwt } from '../verify-jwt.ts'

export const resolveFolderPathController: FastifyPluginCallbackZod = async (
  app,
) => {
  app.get(
    '/folders/resolve-path',
    {
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
      const token = request.cookies.accessToken

      if (!token) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const payload = await verifyJwt(token)

      if (!payload) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const { workspaceId, path } = request.query

      const pathIds = (path ?? '').split('/').filter(Boolean)

      const useCase = makeResolveFolderPathUseCase()
      const result = await useCase.execute({
        userId: payload.userId,
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
