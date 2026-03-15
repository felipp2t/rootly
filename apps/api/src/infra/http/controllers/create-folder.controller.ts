import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeCreateFolderUseCase } from '../factories/make-create-folder-use-case.ts'
import { verifyJwt } from '../verify-jwt.ts'

export const createFolderController: FastifyPluginCallbackZod = async (app) => {
  app.post(
    '/folders',
    {
      schema: {
        summary: 'Create Folder',
        description: 'Create a new folder',
        operationId: 'createFolder',
        tags: ['Folders'],
        body: z.object({
          name: z.string(),
          workspaceId: z.string(),
          parentId: z.string().optional(),
        }),
        response: {
          201: z.object({ folderId: z.string() }),
          400: z.object({ message: z.string() }),
          401: z.object({ message: z.string() }),
          409: z.object({ message: z.string() }),
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

      const { name, parentId, workspaceId } = request.body

      const createFolderUseCase = makeCreateFolderUseCase()

      const result = await createFolderUseCase.execute({
        name,
        parentId,
        workspaceId,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'FolderAlreadyExistsError':
            return reply.status(409).send({ message: error.message })
          case 'InvalidFolderNameError':
            return reply.status(400).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      const { folderId } = result.value

      return reply.status(201).send({ folderId })
    },
  )
}
