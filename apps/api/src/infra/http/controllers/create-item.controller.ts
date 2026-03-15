import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeCreateItemUseCase } from '../factories/make-create-item-use-case.ts'
import { verifyJwt } from '../verify-jwt.ts'

export const createItemsController: FastifyPluginCallbackZod = async (app) => {
  app.post(
    '/items',
    {
      schema: {
        summary: 'Create Item',
        description: 'Create a new item',
        operationId: 'createItem',
        tags: ['Items'],
        body: z.object({
          title: z.string(),
          folderId: z.string().optional(),
          workspaceId: z.string(),
          type: z.enum(['link', 'document', 'text', 'secret']),
          content: z.string().optional(),
        }),
        response: {
          201: z.object({ itemId: z.string() }),
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

      const { folderId, title, type, content, workspaceId } = request.body

      const createItemUseCase = makeCreateItemUseCase()

      const result = await createItemUseCase.execute({
        folderId,
        workspaceId,
        title,
        type,
        content,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'ItemAlreadyExistsError':
            return reply.status(409).send({ message: error.message })
          case 'InvalidItemTitleError':
            return reply.status(400).send({ message: error.message })
          case 'InvalidItemTypeError':
            return reply.status(400).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(201).send({ itemId: result.value.itemId })
    },
  )
}
