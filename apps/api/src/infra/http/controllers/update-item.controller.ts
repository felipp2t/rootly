import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { makeUpdateItemUseCase } from '../factories/make-update-item-use-case.ts'
import { verifyJwtHook } from '../middleware/verify-jwt-hook.ts'

export const updateItemController: FastifyPluginCallbackZod = async (app) => {
  app.patch(
    '/items/:itemId',
    {
      onRequest: verifyJwtHook,
      schema: {
        summary: 'Update Item',
        description: "Update an item's title and/or content.",
        operationId: 'updateItem',
        tags: ['Items'],
        params: z.object({
          itemId: z.string(),
        }),
        body: z.object({
          title: z.string().optional(),
          content: z.string().optional(),
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
      const { itemId } = request.params
      const { title, content } = request.body

      const useCase = makeUpdateItemUseCase()
      const result = await useCase.execute({
        itemId,
        title,
        content,
        actorId: request.userId,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor.name) {
          case 'ItemNotFoundError':
            return reply.status(404).send({ message: error.message })
          case 'ItemArchivedError':
            return reply.status(409).send({ message: error.message })
          case 'InvalidItemTitleError':
            return reply.status(400).send({ message: error.message })
          default:
            return reply.status(500).send({ message: 'Internal Server Error' })
        }
      }

      return reply.status(204).send()
    },
  )
}
